export interface FootprintShape {
  width: number
  height: number
  data: Float32Array
}

const FOOTPRINT_TEXTURE_SIZE = 64

export function generateFootprintShape(isLeftFoot: boolean): FootprintShape {
  const canvas = document.createElement('canvas')
  canvas.width = FOOTPRINT_TEXTURE_SIZE
  canvas.height = FOOTPRINT_TEXTURE_SIZE * 2
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const cx = canvas.width / 2
  const toeY = canvas.height * 0.15
  const ballY = canvas.height * 0.4
  const archY = canvas.height * 0.65
  const heelY = canvas.height * 0.85

  const toesOffsetX = isLeftFoot ? -4 : 4

  ctx.save()
  ctx.translate(cx + toesOffsetX, 0)

  const toeRadius = canvas.width * 0.11
  for (let i = 0; i < 5; i++) {
    const t = i / 4
    const angle = -Math.PI / 2 + (t - 0.5) * Math.PI * 0.5
    const dist = canvas.width * 0.22
    const tx = Math.cos(angle) * dist
    const ty = toeY + Math.sin(angle) * canvas.width * 0.05
    const r = toeRadius * (0.7 + 0.3 * (1 - Math.abs(t - 0.5) * 2))

    const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, r)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.6, 'rgba(255,255,255,0.9)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(tx, ty, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const ballGrad = ctx.createRadialGradient(0, ballY, 0, 0, ballY, canvas.width * 0.3)
  ballGrad.addColorStop(0, 'rgba(255,255,255,1)')
  ballGrad.addColorStop(0.5, 'rgba(255,255,255,0.95)')
  ballGrad.addColorStop(0.85, 'rgba(255,255,255,0.4)')
  ballGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = ballGrad
  ctx.beginPath()
  ctx.ellipse(0, ballY, canvas.width * 0.3, canvas.height * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()

  const archWidth = canvas.width * 0.15
  const archGrad = ctx.createLinearGradient(-archWidth, 0, archWidth, 0)
  archGrad.addColorStop(0, 'rgba(255,255,255,0)')
  archGrad.addColorStop(0.5, 'rgba(255,255,255,0.65)')
  archGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = archGrad
  ctx.beginPath()
  ctx.ellipse(0, archY, archWidth, canvas.height * 0.13, 0, 0, Math.PI * 2)
  ctx.fill()

  const heelGrad = ctx.createRadialGradient(0, heelY, 0, 0, heelY, canvas.width * 0.22)
  heelGrad.addColorStop(0, 'rgba(255,255,255,1)')
  heelGrad.addColorStop(0.6, 'rgba(255,255,255,0.9)')
  heelGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = heelGrad
  ctx.beginPath()
  ctx.ellipse(0, heelY, canvas.width * 0.22, canvas.height * 0.11, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = new Float32Array(canvas.width * canvas.height)

  for (let i = 0; i < imgData.data.length; i += 4) {
    data[i / 4] = imgData.data[i] / 255
  }

  return {
    width: canvas.width,
    height: canvas.height,
    data,
  }
}

export const leftFootShape = generateFootprintShape(true)
export const rightFootShape = generateFootprintShape(false)
