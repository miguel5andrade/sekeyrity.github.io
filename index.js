    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyAcsgIAPrhau7rYBooLPtM_APbeT0WckIs",
      authDomain: "sekeyrity-c3b78.firebaseapp.com",
      databaseURL:
        "https://sekeyrity-c3b78-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "sekeyrity-c3b78",
      storageBucket: "sekeyrity-c3b78.appspot.com",
      messagingSenderId: "874280357227",
      appId: "1:874280357227:web:923dea5aa88fc115f0102e",
      measurementId: "G-8PE4BP9MPG",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    import{getDatabase, ref, child, get, set, update, remove} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const db = getDatabase();
// Create a reference to the root of the database
const ref_root = ref(db, "/");
const ref_user = ref(db,'users')


//Houve a submissao de um codigo no site temos de verificar na base de dados
window.code_submited = function() {
    let codeInput = document.getElementById('codeInput');
    let codeString = codeInput.value;   //codigo inserido

    const default_user = child(ref_root, 'users/default');

// get the default users
get(default_user).then((snapshot) => {
  if (snapshot.exists()) {
    const found_user = snapshot.val();
    let password = found_user.password.toString(); // Accessing the password attribute
    console.log(password);
    if (password === codeString.toString()) {
      console.log("Password is correct!");
      //fazer aparecer no ecrã campos para meter a nova password e email

       // redirecionar para novo html
      window.location.href = "post_signup.html"; // Replace with the URL of the HTML file to load

    } else {
      console.log("Password is incorrect!");
      //fazer aparecer no ecra que o código está errado

       var messageElement = document.getElementById('insert_message');
      messageElement.textContent = "Incorrect code. Please try again."; // Set the message content

    }
  } else {
    var messageElement = document.getElementById('insert_message');
    messageElement.textContent = "Please scan your card again."; // Set the message content
  }
}).catch((error) => {
  console.error("Error reading default user:", error);
});
}

window.get_signup_info = function(){
  let user_email = document.getElementById('emailInput').value;
  let password = document.getElementById('passwordInput').value;
  let cpassword = document.getElementById('cpasswordInput').value;

  //verificar se todos os campos têm valores
  if(user_email === "" || password === "" || cpassword === ""){
    let messageElement = document.getElementById('insert_info_message');
    messageElement.textContent = "Please fill in all fields."; // Set the message conten
  }


  //verificar se o email é válido

  //verificar se as passwords sao iguais 
} 