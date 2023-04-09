require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");

const Person = require("./models/persons");

app.use(cors());

app.use(express.static("build"));
app.use(express.json());

const morgan = require("morgan");

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  // const n = persons.length;
  const t = new Date();
  Person.collection
    .countDocuments()
    .then((cnt) =>
      response.send(
        `<div>Phonebook has info for ${cnt} people<p>${t}</p></div>`
      )
    );
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  const person = Person.findById(id)
    .then((res) => {
      response.json(res);
    })
    .catch((error) => next(error));
  // }
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  // console.log(body);
  if (body === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const person = new Person({
    // name: body.content.name,
    // number: body.content.number,
    ...body,
  });
  person
    .save()
    .then((savedPerson) => response.json(savedPerson))
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = { ...body };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
