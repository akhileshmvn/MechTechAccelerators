// Helper to save files with a picker if available
export async function saveFile(blob: Blob, suggestedName: string, description: string, accept: Record<string, string[]>) {
  try {
    // @ts-ignore - File System Access API is not yet in all TS definitions
    if (window.showSaveFilePicker) {
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description,
          accept
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
    throw new Error("File System Access API not supported");
  } catch (err: any) {
    // Fallback to file-saver if API not supported or user cancelled (though cancel throws AbortError)
    // If it's an abort error, we don't want to saveAs, so we rethrow or handle specific aborts
    if (err.name !== 'AbortError') {
       const { saveAs } = await import('file-saver');
       saveAs(blob, suggestedName);
    }
  }
}
