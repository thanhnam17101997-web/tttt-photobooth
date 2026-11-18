import AppKit

let path = CommandLine.arguments[1]
guard let image = NSImage(contentsOfFile: path),
      let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { fatalError("Cannot read image") }

let width = cg.width, height = cg.height
let bytesPerRow = width * 4
var pixels = [UInt8](repeating: 0, count: bytesPerRow * height)
guard let context = CGContext(data: &pixels, width: width, height: height, bitsPerComponent: 8, bytesPerRow: bytesPerRow, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { fatalError("Cannot make context") }
context.draw(cg, in: CGRect(x: 0, y: 0, width: width, height: height))

for row in 0..<2 {
  for col in 0..<5 {
    let left = col * 251, right = col == 4 ? 1254 : left + 251
    let top = row * 627, bottom = row == 1 ? 1254 : top + 627
    var minX = right, minY = bottom, maxX = left, maxY = top
    for y in top..<bottom { for x in left..<right {
      let alpha = pixels[(y * bytesPerRow) + (x * 4) + 3]
      if alpha > 12 { minX = min(minX, x); minY = min(minY, y); maxX = max(maxX, x); maxY = max(maxY, y) }
    }}
    print("{ x: \(minX), y: \(minY), width: \(maxX - minX + 1), height: \(maxY - minY + 1) },")
  }
}
