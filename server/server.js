const mongoose = require("mongoose")
const Document = require("./Document")

mongoose.connect("mongodb://localhost/google-docs-clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})
const defaultValue = ''
const io = require("socket.io")(3001, {
  cors: {
    orgin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// io.on('connection', socket => {
//   socket.on('get-document', documentId => {
//     const document = findOrCreateDocument(documentId);
//     socket.join(documentId);
//     socket.emit('load-document', document.data)
//     socket.on('send-changes', delta => {
//       // console.log(delta);
//       socket.broadcast.to(documentId).emit("receive-changes", delta)
//     })
//     socket.on("save-document", async data => {
//       await Document.findByIdAndUpdate(documentId, { data })
//     })
//   })
//   console.log("Socket io is connected successfully");
// })

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
  console.log("Socket io is connected successfully");

})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}