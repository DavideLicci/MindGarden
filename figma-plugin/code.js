// Plugin main code: receives SVG strings from UI and creates frames with vector nodes
figma.showUI(__html__, { width: 420, height: 480 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import-svgs') {
    const svgs = msg.svgs || [];
    const created = [];
    for (let i = 0; i < svgs.length; i++) {
      const item = svgs[i];
      try {
        // create node from svg
        const node = figma.createNodeFromSvg(item.content);
        // wrap in a frame for cleanliness
        const frame = figma.createFrame();
        frame.name = item.name || `SVG ${i + 1}`;
        frame.resize(Math.max(node.width, 320), Math.max(node.height, 240));
        node.x = 0;
        node.y = 0;
        frame.appendChild(node);
        // position frames tiled on canvas
        const padding = 40;
        const col = i % 2;
        const row = Math.floor(i / 2);
        frame.x = col * (frame.width + padding) + 100;
        frame.y = row * (frame.height + padding) + 100;
        figma.currentPage.appendChild(frame);
        created.push({ name: frame.name, id: frame.id });
      } catch (err) {
        console.error('Failed to create SVG node', err);
        figma.notify(`Errore importando ${item.name || 'SVG'}`);
      }
    }
    figma.notify(`Importati ${created.length} SVG`);
    figma.ui.postMessage({ type: 'import-done', created });
  }
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};
