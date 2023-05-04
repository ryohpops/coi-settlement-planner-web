importScripts("/highs-build/highs.js")

onmessage = async (e) => {
  const highs = await Module({
    locateFile: (file) => "/highs-build/" + file
  });
  postMessage(highs.solve(e.data))
}
