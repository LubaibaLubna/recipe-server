const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8holrnh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const recipesCollection = client.db('recipeDB').collection('recipes');

    // Get all recipes or filter by email
    app.get('/recipes', async (req, res) => {
      const email = req.query.email;
      const query = email ? { userEmail: email } : {};
      const result = await recipesCollection.find(query).toArray();
      res.send(result);
    });

    // Get a single recipe
    app.get('/recipes/:id', async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.status(400).send({ error: 'Invalid ID' });
      const recipe = await recipesCollection.findOne({ _id: new ObjectId(id) });
      res.send(recipe);
    });

    // Add new recipe
    app.post('/recipes', async (req, res) => {
      const newRecipe = req.body;
      if (!newRecipe.userEmail) return res.status(400).send({ error: 'User email is required' });
      newRecipe.likeCount = 0; 
      const result = await recipesCollection.insertOne(newRecipe);
      res.send(result);
    });

    // Update a recipe
    app.put('/recipes/:id', async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      if (!ObjectId.isValid(id)) return res.status(400).send({ error: 'Invalid ID' });

      const result = await recipesCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedData },
        { returnDocument: 'after' }
      );

      if (!result.value) return res.status(404).send({ message: 'Recipe not found' });
      res.send(result.value);
    });

   app.put('/recipes/:id/like', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await recipesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { likeCount: 0 } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(result.value);
  } catch (error) {
    console.error("Failed to like recipe:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


    // Delete a recipe
    app.delete('/recipes/:id', async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.status(400).send({ error: 'Invalid ID' });
      const result = await recipesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

 
  } finally {
    
  }


}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('🔥 Recipe Book API running');
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});


//ghjkl;