
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Atoob Content Editor (Videos + Thumbnails)
------------------------------------------
• Nice-looking Tkinter/ttk GUI (no PySimpleGUI) to add/remove/edit/reorder items.
• Parses and rewrites your existing `script.js` videoData object and updates thumbnail
  grids inside `atoob.html` ("Videos Being Watched", "Promoted Videos", "Featured Videos").
• If no thumbnail is provided, the app will automatically use YouTube's default thumbnail:
  https://img.youtube.com/vi/<youtubeId>/hqdefault.jpg

Project layout expected (you can point the app at your root folder):
  <project_root>/script.js
  <project_root>/atoob.html
  <project_root>/Thumbnails/   (optional for your own images)

Tested with standard Python 3 + Tkinter.
Optional but recommended: Pillow (PIL) for live image preview. If missing, preview is disabled.
"""
import os
import re
import json
import sys
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

# Optional image preview
try:
    from PIL import Image, ImageTk
    PIL_AVAILABLE = True
except Exception:
    PIL_AVAILABLE = False


# --------------------------- Utilities ---------------------------

def js_object_to_json(js_text):
    """
    Convert a simple JS object literal (single quotes allowed, trailing commas)
    into JSON text. This is not a full JS parser but works for the provided videoData.
    """
    # strip comments (rudimentary)
    js_text = re.sub(r'//.*', '', js_text)
    js_text = re.sub(r'/\*.*?\*/', '', js_text, flags=re.S)

    # ensure keys are quoted:  '1': { ... }  or  1: { ... }
    def quote_keys(m):
        key = m.group(1)
        if key.startswith("'") or key.startswith('"'):
            return f'{key}:'
        else:
            return f'"{key}":'

    js_text = re.sub(r'(?m)^\s*([A-Za-z0-9_\'"]+)\s*:', quote_keys, js_text)

    # Replace single quotes with double quotes carefully
    js_text = re.sub(r"'", r'"', js_text)

    # Remove trailing commas before } or ]
    js_text = re.sub(r',\s*([}\]])', r'\1', js_text)

    return js_text


def extract_video_data(script_js_text):
    """
    Return (prefix, data_dict, suffix) where prefix/suffix are the parts of the file
    outside the videoData object so we can write the object back in place.
    """
    m = re.search(r'(const\s+videoData\s*=\s*\{)(.*?)(\}\s*;)', script_js_text, flags=re.S)
    if not m:
        raise ValueError("Could not find `const videoData = { ... };` in script.js")
    start, obj_body, end = m.group(1), m.group(2), m.group(3)

    json_text = '{' + js_object_to_json(obj_body) + '}'
    try:
        data = json.loads(json_text)
    except Exception as e:
        raise ValueError(f"Failed to parse videoData as JSON: {e}")

    prefix = script_js_text[:m.start(1)]
    suffix = script_js_text[m.end(3):]
    return prefix + start, data, end + suffix


def dict_to_js_object(d):
    """
    Serialize Python dict back to a pretty JS object (single quotes style).
    """
    def to_js(val, indent=0):
        ind = ' ' * indent
        if isinstance(val, dict):
            parts = []
            for k, v in val.items():
                key = f"'{k}'" if not (k.startswith("'") or k.startswith('"')) else k
                parts.append(f"{ind}  {key}: {to_js(v, indent+2)}")
            return '{\n' + ',\n'.join(parts) + f"\n{ind}}}"
        elif isinstance(val, list):
            parts = [to_js(x, indent+2) for x in val]
            return '[\n' + ',\n'.join(f"{ind}  {p}" for p in parts) + f"\n{ind}]"
        elif isinstance(val, str):
            return "'" + val.replace("'", "\\'") + "'"
        elif val is True:
            return 'true'
        elif val is False:
            return 'false'
        elif val is None:
            return 'null'
        else:
            return str(val)

    lines = ["{"]
    for k in d.keys():
        lines.append(f"  '{k}': " + to_js(d[k], 2) + ",")
    if len(lines) > 1:
        lines[-1] = lines[-1].rstrip(',')
    lines.append("}")
    return '\n'.join(lines)


def ensure_thumb(youtube_id, thumb):
    if thumb and thumb.strip():
        return thumb.strip()
    if youtube_id and youtube_id.strip():
        return f"https://img.youtube.com/vi/{youtube_id.strip()}/hqdefault.jpg"
    return ""


# --------------------------- HTML patching ---------------------------

SECTION_MAP = {
    # container_id: list_key in GUI model
    'watching-videos': 'watching',
    'promoted-videos': 'promoted',
    'featured-videos': 'featured',
}

def build_thumb_block(item):
    # item keys: title, description, youtubeId, thumbnail
    title = item.get('title','').strip() or 'Untitled'
    youtube_id = (item.get('youtubeId') or '').strip()
    thumb = ensure_thumb(youtube_id, item.get('thumbnail',''))
    return title, youtube_id, thumb


def write_updated_html(html_text, model_lists):
    """
    Replace inner blocks of the three known grids with fresh content based on model_lists.
    """
    def render_section(items, base_index):
        """Return HTML for a grid; returns html and new index after placing items."""
        parts = []
        idx = base_index
        for item in items:
            title, youtube_id, thumb = build_thumb_block(item)
            idx += 1
            video_q = idx  # ?video=<index>
            href = f'video.html?video={video_q}'
            parts.append(
                """                    <div class=\"video-thumb\">
                        <a href=\"%s\">
                            <img src=\"%s\" alt=\"%s\">
                            <p>%s</p>
                        </a>
                    </div>""" % (href, thumb, title.replace('"','&quot;'), title)
            )
        return '\n'.join(parts), idx

    # Replace the inside of each grid by looking for <div class="video-grid" id="..."> ... </div>
    idx = 0
    for container_id in SECTION_MAP.keys():
        pat = re.compile(
            rf'(<div\s+class="video-grid"\s+id="{re.escape(container_id)}"\s*>\s*)(.*?)(\s*</div>)',
            flags=re.S
        )
        if not re.search(pat, html_text):
            continue
        new_inner, idx = render_section(model_lists[SECTION_MAP[container_id]], idx)
        html_text = re.sub(pat, r'\1' + new_inner + r'\3', html_text, count=1)
    return html_text


# --------------------------- Data Model ---------------------------

class ContentModel:
    def __init__(self):
        # Using lists per section; each item is a dict
        self.sections = {
            'watching': [],
            'promoted': [],
            'featured': [],
        }

    @staticmethod
    def from_videoData(video_dict):
        """
        video_dict is like {'1': {...}, '2': {...}}.
        We'll distribute items into sections in order: first N to watching, next to promoted, next to featured
        based on current atoob.html counts. If counts unavailable, split roughly equally.
        """
        items = [video_dict[k] | {'_key': k} for k in sorted(video_dict, key=lambda x: int(x) if x.isdigit() else x)]
        # Simple default split into thirds
        n = len(items)
        a = items[: n//3 or 0]
        b = items[n//3: 2*n//3 or 0]
        c = items[2*n//3: ]
        m = ContentModel()
        m.sections['watching'] = [ContentModel._normalize_item(x) for x in a]
        m.sections['promoted'] = [ContentModel._normalize_item(x) for x in b]
        m.sections['featured'] = [ContentModel._normalize_item(x) for x in c]
        return m

    @staticmethod
    def _normalize_item(d):
        return {
            'title': d.get('title','').strip(),
            'description': d.get('description','').strip(),
            'youtubeId': d.get('youtubeId','').strip(),
            'thumbnail': d.get('thumbnail','').strip() if d.get('thumbnail') else '',
        }

    def to_videoData(self):
        """
        Flatten sections back to a sequential {'1': {...}, '2': {...}} dict.
        Order is watching -> promoted -> featured
        """
        seq = []
        for key in ('watching','promoted','featured'):
            seq.extend(self.sections[key])
        out = {}
        for i, item in enumerate(seq, start=1):
            out[str(i)] = {
                'title': item.get('title',''),
                'description': item.get('description',''),
                'youtubeId': item.get('youtubeId',''),
                # Keep script.js schema minimal; omit thumbnails there by default.
            }
        return out


# --------------------------- GUI ---------------------------

class EditorApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Atoob Content Editor")
        self.geometry("1040x640")
        self.minsize(960, 560)

        # Theme-ish tweaks
        try:
            self.call("tk", "scaling", 1.2)
        except Exception:
            pass
        style = ttk.Style(self)
        if 'clam' in style.theme_names():
            style.theme_use('clam')
        style.configure('TButton', padding=6)
        style.configure('Accent.TButton', padding=8, relief='raised')
        style.configure('Header.TLabel', font=('Segoe UI', 16, 'bold'))

        self.project_root = os.getcwd()
        self.script_js_path = None
        self.atoob_html_path = None

        self.model = ContentModel()

        self._build_menu()
        self._build_layout()

    # ----- UI construction -----
    def _build_menu(self):
        m = tk.Menu(self)
        filem = tk.Menu(m, tearoff=False)
        filem.add_command(label="Open Project Folder…", command=self.choose_project)
        filem.add_separator()
        filem.add_command(label="Save", command=self.save_all, accelerator="Ctrl+S")
        filem.add_command(label="Save As…", command=self.save_all_as)
        filem.add_separator()
        filem.add_command(label="Exit", command=self.destroy)
        m.add_cascade(label="File", menu=filem)

        helpm = tk.Menu(m, tearoff=False)
        helpm.add_command(label="About", command=lambda: messagebox.showinfo(
            "About",
            "Atoob Content Editor\nEdit videos, descriptions, and thumbnails.\nMade with Tkinter."
        ))
        m.add_cascade(label="Help", menu=helpm)
        self.config(menu=m)
        self.bind_all("<Control-s>", lambda e: self.save_all())

    def _build_layout(self):
        top = ttk.Frame(self, padding=10)
        top.pack(fill='both', expand=True)

        # Header row
        hdr = ttk.Frame(top)
        hdr.pack(fill='x')
        ttk.Label(hdr, text="Atoob Content Editor", style='Header.TLabel').pack(side='left')
        self.project_lbl = ttk.Label(hdr, text=f"  —  {self.project_root}")
        self.project_lbl.pack(side='left')

        # Body: left tree, right editor
        body = ttk.Panedwindow(top, orient='horizontal')
        body.pack(fill='both', expand=True, pady=(8,0))

        # Left
        left = ttk.Frame(body)
        body.add(left, weight=2)

        self.section_var = tk.StringVar(value='watching')
        tab = ttk.Notebook(left)
        self.trees = {}
        for sec_key, sec_title in [('watching','Watching'), ('promoted','Promoted'), ('featured','Featured')]:
            frm = ttk.Frame(tab)
            tab.add(frm, text=sec_title)
            tree = self._make_tree(frm)
            self.trees[sec_key] = tree
        tab.pack(fill='both', expand=True)

        # Buttons under tree
        bar = ttk.Frame(left)
        bar.pack(fill='x', pady=6)
        ttk.Button(bar, text="Add", command=self.add_item, style='Accent.TButton').pack(side='left')
        ttk.Button(bar, text="Edit", command=self.edit_selected).pack(side='left', padx=4)
        ttk.Button(bar, text="Remove", command=self.remove_selected).pack(side='left', padx=4)
        ttk.Button(bar, text="Move Up", command=lambda: self.move_selected(-1)).pack(side='left', padx=12)
        ttk.Button(bar, text="Move Down", command=lambda: self.move_selected(1)).pack(side='left')

        # Right
        right = ttk.Frame(body, padding=(12,0,0,0))
        body.add(right, weight=3)

        form = ttk.LabelFrame(right, text="Item Details", padding=10)
        form.pack(fill='x')
        self.title_var = tk.StringVar()
        self.desc_var = tk.StringVar()
        self.yt_var = tk.StringVar()
        self.thumb_var = tk.StringVar()

        self._mk_labeled_entry(form, "Title", self.title_var, 0)
        self._mk_labeled_entry(form, "Description", self.desc_var, 1)
        self._mk_labeled_entry(form, "YouTube ID", self.yt_var, 2)
        row = ttk.Frame(form)
        row.grid(row=3, column=0, columnspan=2, sticky='ew', pady=4)
        ttk.Label(row, text="Thumbnail").pack(side='left', padx=(0,8))
        ent = ttk.Entry(row, textvariable=self.thumb_var)
        ent.pack(side='left', fill='x', expand=True)
        ttk.Button(row, text="Browse…", command=self.browse_thumb).pack(side='left', padx=6)
        ttk.Button(row, text="Use YouTube default", command=self.use_default_thumb).pack(side='left')

        self.preview_lbl = ttk.Label(right, text="(thumbnail preview)", anchor='center')
        self.preview_lbl.pack(fill='both', expand=True, pady=10)

        # Bottom toolbar
        bottom = ttk.Frame(top)
        bottom.pack(fill='x', pady=(6,0))
        ttk.Button(bottom, text="Load from script.js / atoob.html", command=self.load_all).pack(side='left')
        ttk.Button(bottom, text="Save to script.js + atoob.html", command=self.save_all, style='Accent.TButton').pack(side='left', padx=6)

        # Initial load attempt
        self.autodetect_project()

    def _make_tree(self, parent):
        tree = ttk.Treeview(parent, columns=('title','youtubeId'), show='headings', selectmode='browse')
        tree.heading('title', text='Title')
        tree.heading('youtubeId', text='YouTube ID')
        tree.column('title', width=280, anchor='w')
        tree.column('youtubeId', width=160, anchor='center')
        tree.pack(fill='both', expand=True)
        tree.bind('<<TreeviewSelect>>', self.on_select_tree)
        return tree

    def _mk_labeled_entry(self, parent, label, var, row):
        ttk.Label(parent, text=label).grid(row=row, column=0, sticky='w', pady=4)
        ent = ttk.Entry(parent, textvariable=var)
        ent.grid(row=row, column=1, sticky='ew', padx=(6,0), pady=4)
        parent.grid_columnconfigure(1, weight=1)
        return ent

    # ----- Project detection / load/save -----

    def autodetect_project(self):
        candidates = [
            os.path.join(self.project_root, 'script.js'),
            os.path.join(self.project_root, 'youtube', 'script.js'),
        ]
        html_candidates = [
            os.path.join(self.project_root, 'atoob.html'),
            os.path.join(self.project_root, 'youtube', 'atoob.html'),
        ]
        for p in candidates:
            if os.path.isfile(p):
                self.script_js_path = p
                break
        for p in html_candidates:
            if os.path.isfile(p):
                self.atoob_html_path = p
                break
        self.project_lbl.config(text=f"  —  {self.project_root}")
        if self.script_js_path and self.atoob_html_path:
            self.load_all()

    def choose_project(self):
        folder = filedialog.askdirectory(initialdir=self.project_root, title="Select Project Root")
        if not folder:
            return
        self.project_root = folder
        self.script_js_path = None
        self.atoob_html_path = None
        self.autodetect_project()

    def load_all(self):
        if not self.script_js_path or not os.path.isfile(self.script_js_path):
            messagebox.showerror("Missing file", "Could not find script.js in the selected project.")
            return
        if not self.atoob_html_path or not os.path.isfile(self.atoob_html_path):
            messagebox.showerror("Missing file", "Could not find atoob.html in the selected project.")
            return

        with open(self.script_js_path, 'r', encoding='utf-8') as f:
            js_text = f.read()
        try:
            self._script_prefix, video_dict, self._script_suffix = extract_video_data(js_text)
        except Exception as e:
            messagebox.showerror("Parse error", str(e))
            return
        self.model = ContentModel.from_videoData(video_dict)

        # populate trees
        for sec in ('watching','promoted','featured'):
            self._reload_tree(sec)

        # load html text for later write
        with open(self.atoob_html_path, 'r', encoding='utf-8') as f:
            self._html_text = f.read()

        messagebox.showinfo("Loaded", "Loaded content from script.js and atoob.html.")

    def save_all(self):
        if not (self.script_js_path and self.atoob_html_path):
            messagebox.showerror("No project", "Please open a project folder first.")
            return
        # build new videoData
        video_data = self.model.to_videoData()
        js_obj = dict_to_js_object(video_data)
        new_js = self._script_prefix + js_obj + self._script_suffix
        try:
            with open(self.script_js_path, 'w', encoding='utf-8') as f:
                f.write(new_js)
        except Exception as e:
            messagebox.showerror("Write error", f"Failed to write script.js: {e}")
            return

        # patch html sections
        new_html = write_updated_html(self._html_text, self.model.sections)
        try:
            with open(self.atoob_html_path, 'w', encoding='utf-8') as f:
                f.write(new_html)
        except Exception as e:
            messagebox.showerror("Write error", f"Failed to write atoob.html: {e}")
            return

        messagebox.showinfo("Saved", "Updated script.js and atoob.html successfully.")

    def save_all_as(self):
        # Save copies next to originals
        if not (self.script_js_path and self.atoob_html_path):
            messagebox.showerror("No project", "Please open a project folder first.")
            return
        # choose directory
        out_dir = filedialog.askdirectory(initialdir=self.project_root, title="Choose output folder")
        if not out_dir:
            return

        video_data = self.model.to_videoData()
        js_obj = dict_to_js_object(video_data)
        new_js = self._script_prefix + js_obj + self._script_suffix

        # read current html (in case user reopened since load)
        with open(self.atoob_html_path, 'r', encoding='utf-8') as f:
            current_html = f.read()
        new_html = write_updated_html(current_html, self.model.sections)

        try:
            with open(os.path.join(out_dir, 'script.js'), 'w', encoding='utf-8') as f:
                f.write(new_js)
            with open(os.path.join(out_dir, 'atoob.html'), 'w', encoding='utf-8') as f:
                f.write(new_html)
        except Exception as e:
            messagebox.showerror("Write error", f"Failed to write files: {e}")
            return

        messagebox.showinfo("Saved", f"Wrote copies to:\n{out_dir}")

    # ----- Tree helpers -----

    def _reload_tree(self, sec):
        tree = self.trees[sec]
        tree.delete(*tree.get_children())
        for i, item in enumerate(self.model.sections[sec], start=1):
            tree.insert('', 'end', iid=str(i), values=(item.get('title',''), item.get('youtubeId','')))

    def current_section(self):
        # Which tab is selected?
        nb = self.trees['watching'].master.master  # notebook
        idx = nb.index(nb.select())
        return ['watching','promoted','featured'][idx]

    def selected_index(self):
        sec = self.current_section()
        tree = self.trees[sec]
        sel = tree.selection()
        if not sel:
            return sec, None, None
        iid = sel[0]
        return sec, int(iid)-1, tree

    def on_select_tree(self, event=None):
        sec, idx, tree = self.selected_index()
        if idx is None:
            return
        item = self.model.sections[sec][idx]
        self.title_var.set(item.get('title',''))
        self.desc_var.set(item.get('description',''))
        self.yt_var.set(item.get('youtubeId',''))
        self.thumb_var.set(item.get('thumbnail',''))
        self.update_preview()

    # ----- Item ops -----

    def add_item(self):
        sec = self.current_section()
        new_item = {'title':'New Video','description':'','youtubeId':'','thumbnail':''}
        self.model.sections[sec].append(new_item)
        self._reload_tree(sec)
        # select new item
        tree = self.trees[sec]
        last = str(len(self.model.sections[sec]))
        tree.selection_set(last)
        tree.see(last)
        self.on_select_tree()

    def edit_selected(self):
        sec, idx, tree = self.selected_index()
        if idx is None:
            messagebox.showwarning("No selection", "Select an item to edit.")
            return
        # Apply fields to model
        item = self.model.sections[sec][idx]
        item['title'] = self.title_var.get().strip()
        item['description'] = self.desc_var.get().strip()
        item['youtubeId'] = self.yt_var.get().strip()
        item['thumbnail'] = self.thumb_var.get().strip()
        self._reload_tree(sec)
        tree.selection_set(str(idx+1))

    def remove_selected(self):
        sec, idx, tree = self.selected_index()
        if idx is None:
            return
        del self.model.sections[sec][idx]
        self._reload_tree(sec)
        # clear form
        self.title_var.set(''); self.desc_var.set(''); self.yt_var.set(''); self.thumb_var.set('')
        self.update_preview()

    def move_selected(self, delta):
        sec, idx, tree = self.selected_index()
        if idx is None:
            return
        lst = self.model.sections[sec]
        new_idx = idx + delta
        if not (0 <= new_idx < len(lst)):
            return
        lst[idx], lst[new_idx] = lst[new_idx], lst[idx]
        self._reload_tree(sec)
        tree.selection_set(str(new_idx+1))
        tree.see(str(new_idx+1))

    # ----- Thumbnail helpers -----

    def browse_thumb(self):
        initial = self.project_root
        path = filedialog.askopenfilename(
            initialdir=initial,
            title="Choose thumbnail image",
            filetypes=[("Images", "*.png;*.jpg;*.jpeg;*.gif;*.webp;*.bmp"), ("All files", "*.*")]
        )
        if not path:
            return
        # store relative path if under project
        try:
            rel = os.path.relpath(path, self.project_root)
        except Exception:
            rel = path
        self.thumb_var.set(rel)
        self.update_preview()

    def use_default_thumb(self):
        yt = self.yt_var.get().strip()
        if not yt:
            messagebox.showwarning("Missing YouTube ID", "Enter a YouTube ID first.")
            return
        self.thumb_var.set(f"https://img.youtube.com/vi/{yt}/hqdefault.jpg")
        self.update_preview()

    def update_preview(self):
        if not PIL_AVAILABLE:
            self.preview_lbl.config(text="(Install Pillow for thumbnail preview)")
            return
        path = self.thumb_var.get().strip()
        if not path:
            self.preview_lbl.config(image='', text="(thumbnail preview)")
            return
        try:
            if path.lower().startswith('http'):
                # simple URL preview not supported without requests; skip
                self.preview_lbl.config(text="(Remote URL preview not available)")
                return
            full = path if os.path.isabs(path) else os.path.join(self.project_root, path)
            img = Image.open(full)
            img.thumbnail((480, 320))
            self._imgtk = ImageTk.PhotoImage(img)
            self.preview_lbl.config(image=self._imgtk, text='')
        except Exception as e:
            self.preview_lbl.config(text=f"(Preview error: {e})", image='')


if __name__ == "__main__":
    app = EditorApp()
    app.mainloop()
