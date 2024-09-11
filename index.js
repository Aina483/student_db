// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const readlineSync = require('readline-sync');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://PROCESS.ENV.DB_USERNAME:PROCESS.ENV.DB_PASSWORD@cluster0.bpcvo.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB', err));

// Define the schema for student collection
const studentSchema = new mongoose.Schema({
    StudentName: { type: String, required: true, maxlength: 30 },
    CollegeName: { type: String, required: true, maxlength: 50 },
    Round1Marks: { type: Number, min: 0, max: 10, required: true },
    Round2Marks: { type: Number, min: 0, max: 10, required: true },
    Round3Marks: { type: Number, min: 0, max: 10, required: true },
    TechnicalRoundMarks: { type: Number, min: 0, max: 20, required: true },
    TotalMarks: { type: Number },
    Result: { type: String },
    rank: { type: Number }
});

// Create the model
const Student = mongoose.model('Student', studentSchema);

// Function to take user input and apply validations
const inputStudentDetails = async () => {
    // Input student detail

    let StudentName = readlineSync.question('Enter student name (max 30 characters): ');
    // if (StudentName.length > 30) {
    //     console.log('Error: Student name exceeds the maximum length of 30.');
    //     readlineSync.question("Enter student name:");
    //     return;
    // }

    while(StudentName.length>30){
          StudentName=readlineSync.question('Enter student name:');
    }
    

    

  let CollegeName = readlineSync.question('Enter college name (max 50 characters): ');
    // if (CollegeName.length > 50) {
    //     console.log('Error: College name exceeds the maximum length of 50.');
    //     return;
    // }

    while(CollegeName.length>50){
        CollegeName=readlineSync.question("Enter college name:");
    }


    let Round1Marks = parseInt(readlineSync.question('Enter Round 1 marks (0-10): '), 10);
    while(Round1Marks>10 || Round1Marks<0){
        Round1Marks=parseInt(readlineSync.question("Enter round 1 marks:"));
    }
    let Round2Marks = parseInt(readlineSync.question('Enter Round 2 marks (0-10): '), 10);
    while(Round2Marks>10 || Round2Marks<0){
        Round2Marks=parseInt(readlineSync.question("Enter round 2 marks:"));
    }
    let Round3Marks = parseInt(readlineSync.question('Enter Round 3 marks (0-10): '), 10);
    while(Round3Marks>10 || Round3Marks<0){
        Round3Marks=parseInt(readlineSync.question("Enter round 3 marks:"));
    }
    let TechnicalRoundMarks = parseInt(readlineSync.question('Enter Technical Round marks (0-20): '), 10);
    while(TechnicalRoundMarks>20 || TechnicalRoundMarks<0){
        TechnicalRoundMarks=parseInt(readlineSync.question("Enter technical round marks:"));
    }

    // Validations for marks
    // if ([Round1Marks, Round2Marks, Round3Marks, TechnicalRoundMarks].some(mark => mark < 0 || mark > 20)) {
    //     console.log('Error: Marks should be within the valid ranges.');
    //     return;
    // }

   
    
    

   

    // Calculating total marks
    const TotalMarks = Round1Marks + Round2Marks + Round3Marks + TechnicalRoundMarks;

    // Decision making based on marks
    let Result = TotalMarks >= 35 ? 'Selected' : 'Rejected';
    const miniper=70;
    const round1per=(Round1Marks/10)*100;
    const round2per=(Round2Marks/10)*100;
    const round3per=(Round3Marks/10)*100;
    const techroundper=(TechnicalRoundMarks/20)*100;
    if(round1per<miniper || round2per<miniper || round3per<miniper || techroundper<miniper){
        Result='Rejected';
    }


    // Saving the student to the DB before calculating rank
    const newStudent = new Student({
        StudentName,
        CollegeName,
        Round1Marks,
        Round2Marks,
        Round3Marks,
        TechnicalRoundMarks,
        TotalMarks,
        Result
    });

    try {
        await newStudent.save(); // Save the student first

        // Now calculate the rank based on all students, including the newly added one
        const calculateRank = async (studentId) => {
            try {
                // Fetch all students and sort by TotalMarks in descending order
                const students = await Student.find().sort({ TotalMarks: -1 });
    
                // Find the rank of the current student by comparing TotalMarks
                let rank = 1;
                for (const student of students) {
                    if (student._id.toString() === studentId.toString()) {
                        break;
                    }
                    rank++;
                }
    
                return rank;
            } catch (err) {
                console.error('Error calculating rank:', err.message);
                return null;
            }
        };

        // Calculate the rank for the current student
        const rank = await calculateRank(newStudent._id);

        // Update the student's rank in the database
        newStudent.rank = rank;
        await newStudent.save();

        console.log(`Student details saved successfully! Rank: ${rank}`);
    } catch (err) {
        console.error('Error saving student details:', err.message);
    }
};

// Function to display all records
const displayAllStudents = async () => {
    try {
        const students = await Student.find().sort({ TotalMarks: -1 }); // Sort by TotalMarks in descending order
        console.table(students.map(student => ({
            StudentName: student.StudentName,
            CollegeName: student.CollegeName,
            Round1Marks: student.Round1Marks,
            Round2Marks: student.Round2Marks,
            Round3Marks: student.Round3Marks,
            TechnicalRoundMarks: student.TechnicalRoundMarks,
            TotalMarks: student.TotalMarks,
            Result: student.Result,
            Rank: student.rank
        })));
    } catch (err) {
        console.error('Error retrieving student records:', err.message);
    }
};

// Main function to run the program
const runProgram = async () => {
    console.log("1. Input student details");
    console.log("2. Display all students");
    const choice = readlineSync.question('Enter your choice: ');

    if (choice === '1') {
        await inputStudentDetails();
    } else if (choice === '2') {
        await displayAllStudents();
    } else {
        console.log('Invalid choice');
    }

    mongoose.disconnect();
};

// Start the program
runProgram();
