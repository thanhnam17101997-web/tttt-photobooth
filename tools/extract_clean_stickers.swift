import AppKit

struct Component { let pixels: [Int]; let minX: Int; let minY: Int; let maxX: Int; let maxY: Int }
let arguments = CommandLine.arguments
guard arguments.count == 3 else { fatalError("Usage: extract_clean_stickers input-dir output-dir") }
let inputDir = URL(fileURLWithPath: arguments[1])
let outputDir = URL(fileURLWithPath: arguments[2])
try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

for sheet in 1...4 {
  let source = inputDir.appendingPathComponent("tttt-stickers-sheet-\(String(format: "%02d", sheet)).png")
  guard let image = NSImage(contentsOf: source), let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { fatalError("Cannot read \(source.path)") }
  let width = cg.width, height = cg.height, rowBytes = width * 4, total = width * height
  var sourcePixels = [UInt8](repeating: 0, count: rowBytes * height)
  guard let context = CGContext(data: &sourcePixels, width: width, height: height, bitsPerComponent: 8, bytesPerRow: rowBytes, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { fatalError("Cannot create context") }
  context.draw(cg, in: CGRect(x: 0, y: 0, width: width, height: height))
  var active = [Bool](repeating: false, count: total)
  for y in 0..<height { for x in 0..<width { active[y * width + x] = sourcePixels[y * rowBytes + x * 4 + 3] > 32 } }
  var seen = [Bool](repeating: false, count: total)
  var byCell = [Int: Component]()
  for start in 0..<total where active[start] && !seen[start] {
    var queue = [start], head = 0; seen[start] = true
    var minX = start % width, maxX = minX, minY = start / width, maxY = minY
    while head < queue.count {
      let value = queue[head]; head += 1
      let x = value % width, y = value / width
      minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
      for (nextX,nextY) in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)] where nextX >= 0 && nextX < width && nextY >= 0 && nextY < height {
        let next = nextY * width + nextX
        if active[next] && !seen[next] { seen[next] = true; queue.append(next) }
      }
    }
    guard queue.count > 200 else { continue }
    let cell = min(1, ((minY + maxY) / 2) / 627) * 5 + min(4, ((minX + maxX) / 2) / 251)
    let component = Component(pixels: queue, minX: minX, minY: minY, maxX: maxX, maxY: maxY)
    if byCell[cell]?.pixels.count ?? 0 < component.pixels.count { byCell[cell] = component }
  }
  for cell in 0..<10 {
    guard let component = byCell[cell] else { fatalError("Missing sticker \(sheet)-\(cell)") }
    let padding = 8, outputWidth = component.maxX - component.minX + 1 + padding * 2, outputHeight = component.maxY - component.minY + 1 + padding * 2, outputRowBytes = outputWidth * 4
    var output = [UInt8](repeating: 0, count: outputRowBytes * outputHeight)
    for pixel in component.pixels {
      let x = pixel % width, y = pixel / width
      let sourceOffset = y * rowBytes + x * 4
      let outputOffset = (y - component.minY + padding) * outputRowBytes + (x - component.minX + padding) * 4
      output[outputOffset..<outputOffset+4] = sourcePixels[sourceOffset..<sourceOffset+4]
    }
    let data = Data(output)
    guard let provider = CGDataProvider(data: data as CFData), let clean = CGImage(width: outputWidth, height: outputHeight, bitsPerComponent: 8, bitsPerPixel: 32, bytesPerRow: outputRowBytes, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue), provider: provider, decode: nil, shouldInterpolate: true, intent: .defaultIntent), let png = NSBitmapImageRep(cgImage: clean).representation(using: .png, properties: [:]) else { fatalError("Cannot create PNG") }
    let file = outputDir.appendingPathComponent("s\(String(format: "%02d", sheet))-\(String(format: "%02d", cell + 1)).png")
    try png.write(to: file)
  }
}
