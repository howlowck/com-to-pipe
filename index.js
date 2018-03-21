/* Set up Named Pipe */
const net = require('net')
const path = require('path')
const SerialPort = require('serialport')

const PIPE_NAME = path.join('\\\\.\\pipe\\comport')
const BAUD_RATE = 9600

const port = new SerialPort('COM3', {
  baudRate: BAUD_RATE,
  autoOpen: false
})

function openPort () {
  port.open(function (err) {
    if (err) {
      console.log('error opening port: ', err.message)
      console.log('retrying in 5 seconds...')
      setTimeout(() => {
        openPort()
      }, 5000)
    }
  })
}

openPort()

port.on('open', function () {
  console.log('port opened')
})

const server = net.createServer(function (serverStream) {
  console.log('server connected')
  // The open event is always emitted
  port.on('data', function (data) {
    console.log('Data:', data)
    serverStream.write(data)
  })

  // Read data that is available but keep the stream from entering "flowing mode"
  port.on('readable', function () {
    console.log('Data:', port.read())
  })

  serverStream.on('data', (data) => {
    console.log('data received')
    port.write(data)
  })

  serverStream.on('end', function () {
    console.log('serverend')
    server.close()
  })
}).listen(PIPE_NAME, () => {
  console.log('server listening')
})

server.on('close', () => {
  console.log('server closed')
})

/* Client just for testing */

console.log('pipe: ', PIPE_NAME)

const client = net.connect(PIPE_NAME, function () {

})

client.on('data', (data) => {
  console.log('client (VM) data received:', data)
})

client.on('end', () => {
  console.log('client ended')
})
