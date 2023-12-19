const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const port = 8000;
let isMatch = false;

app.use(express.json());
// Enable CORS
app.use(cors({
  origin: 'https://vijayaditya-portfolio.netlify.app',
}));
app.use(bodyParser.json());

app.post('/verifyPassword', async (req, res) => {
  const { plainPassword } = req.body;
  //const password = '#0112';

  try {
    const storedHashedPassword = '$2a$10$zpCA3xfVIKljCjnW4ewEVeTem0au/hDcZylRbKpMvtEXBP6htYW0q'; 

    // Compare the plain password received from the client with the stored hashed password
    isMatch = await bcrypt.compare(plainPassword, storedHashedPassword);

    res.json({ success: isMatch });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.get('/', async (req, res) => {
    try {
      // Read JSON data from the file
      const data = await fs.readFile('projects.json', 'utf-8');
      const jsonData = JSON.parse(data);
  
      // Send the projects as JSON response
      res.json(jsonData.projects);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error reading JSON file');
    }
});

app.post('/addJson', async (req, res) => {
    try {
        // Read existing JSON file
        const data = await fs.readFile('projects.json', 'utf-8');
        const jsonData = JSON.parse(data);

        // Modify JSON data (add or delete a row)
        // For example, let's add a new project
        const newProject= req.body.project;
        newProject["id"]=jsonData.count+1;


        console.log(newProject);

        jsonData.count=jsonData.count+1;
        jsonData.projects.push(req.body.project);
        
        // Save the updated JSON data back to the file
        await fs.writeFile('projects.json', JSON.stringify(jsonData, null, 2));
        
        res.status(200).json({ success: true, message: 'JSON file updated successfully' });

        console.log('Project added successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating JSON file' });
    }
});

app.post('/deleteJson', async (req, res) => {
    try {
      const projectNameToDelete = req.body.name;
  
      // Read existing JSON file
      const data = await fs.readFile('projects.json', 'utf-8');
      const jsonData = JSON.parse(data);
      jsonData.count=jsonData.count-1;
  
      // Find the index of the project to delete
      const projectIndex = jsonData.projects.findIndex(project => project.name === projectNameToDelete);
  
      // If project found, remove it from the array
      if (projectIndex !== -1) {
        jsonData.projects.splice(projectIndex, 1);
  
        // Save the updated JSON data back to the file
        await fs.writeFile('projects.json', JSON.stringify(jsonData, null, 2));
  
        res.status(200).json({ success: true, message: 'Project deleted successfully' });
        console.log('Project deleted successfully!');
      } else {
        res.status(404).json({ success: false, message: 'Project not found' });
        console.log('Project not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error deleting project' });
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
