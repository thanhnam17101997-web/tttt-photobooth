import AppKit

let args = CommandLine.arguments
guard args.count == 7,
      let x = Int(args[3]), let y = Int(args[4]),
      let width = Int(args[5]), let height = Int(args[6]) else {
  fatalError("Usage: crop_stickers input output x y width height")
}

let sourceURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])
guard let image = NSImage(contentsOf: sourceURL),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  fatalError("Could not read source PNG")
}

let cgY = cgImage.height - y - height
let rect = CGRect(x: x, y: cgY, width: width, height: height)
guard let crop = cgImage.cropping(to: rect),
      let data = NSBitmapImageRep(cgImage: crop).representation(using: .png, properties: [:]) else {
  fatalError("Could not crop PNG")
}
try data.write(to: outputURL)
