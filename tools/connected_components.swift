import AppKit

let path = CommandLine.arguments[1]
let threshold = UInt8(CommandLine.arguments.dropFirst(2).first ?? "32") ?? 32
guard let image = NSImage(contentsOfFile: path),
      let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { fatalError("Cannot read image") }

let width = cg.width, height = cg.height, rowBytes = width * 4, total = width * height
var pixels = [UInt8](repeating: 0, count: rowBytes * height)
guard let context = CGContext(data: &pixels, width: width, height: height, bitsPerComponent: 8, bytesPerRow: rowBytes, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { fatalError("Cannot make context") }
context.draw(cg, in: CGRect(x: 0, y: 0, width: width, height: height))

var active = [Bool](repeating: false, count: total)
for y in 0..<height { for x in 0..<width { active[y * width + x] = pixels[y * rowBytes + x * 4 + 3] > threshold } }
var seen = [Bool](repeating: false, count: total)
var result: [(Int, Int, Int, Int, Int)] = []
for start in 0..<total where active[start] && !seen[start] {
  var queue = [start], head = 0; seen[start] = true
  var minX = start % width, maxX = minX, minY = start / width, maxY = minY
  while head < queue.count {
    let value = queue[head]; head += 1
    let x = value % width, y = value / width
    minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
    for (nx, ny) in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)] where nx >= 0 && nx < width && ny >= 0 && ny < height {
      let next = ny * width + nx
      if active[next] && !seen[next] { seen[next] = true; queue.append(next) }
    }
  }
  if queue.count > 200 { result.append((queue.count, minX, minY, maxX-minX+1, maxY-minY+1)) }
}
for item in result.sorted(by: { $0.0 > $1.0 }) { print("area \(item.0): {x:\(item.1), y:\(item.2), width:\(item.3), height:\(item.4)}") }
