(function(){
  const state = {
    timer: 0,
    canvas: null,
    ctx: null
  };

  const getContext = (fallbackCtx) => {
    if(fallbackCtx) return fallbackCtx;
    if(state.ctx) return state.ctx;
    if(state.canvas) return state.canvas.getContext('2d');
    const canvas = document.getElementById('game-canvas');
    if(canvas) state.canvas = canvas;
    if(canvas) state.ctx = canvas.getContext('2d');
    return state.ctx;
  };

  const clearScene = (ctx) => {
    if(!ctx) return;
    ctx.fillStyle = '#070513';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const drawMessage = (ctx) => {
    if(!ctx) return;
    const pulse = 0.55 + 0.45 * Math.sin(state.timer * 1.6);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fdf7f0';
    ctx.font = '42px "Press Start 2P", monospace';
    ctx.fillText('TO BE CONTINUED', ctx.canvas.width / 2, ctx.canvas.height / 2 - 18);
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = `rgba(255, 225, 200, ${0.6 + 0.3 * pulse})`;
    ctx.fillText('THANKS FOR PLAYING – LEVEL 2 COMING SOON', ctx.canvas.width / 2, ctx.canvas.height / 2 + 42);
    ctx.restore();
  };

  window.level2 = {
    init({ canvas, ctx }) {
      state.canvas = canvas ?? state.canvas;
      state.ctx = ctx ?? getContext(ctx);
      state.timer = 0;
      clearScene(getContext(ctx));
      drawMessage(getContext(ctx));
    },
    update(dt) {
      state.timer += dt;
    },
    draw(ctx) {
      const context = getContext(ctx);
      if(!context) return;
      clearScene(context);
      drawMessage(context);
    }
  };
})();
