importScripts("/highs-build/highs.js")

let highs
onmessage = async (e) => {
  if (!highs) {
    highs = await Module({
      locateFile: (file) => "/highs-build/" + file
    })
  }

  postMessage(highs.solve(e.data))
}
