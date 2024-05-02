    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAcsgIAPrhau7rYBooLPtM_APbeT0WckIs",
    authDomain: "sekeyrity-c3b78.firebaseapp.com",
    databaseURL: "https://sekeyrity-c3b78-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sekeyrity-c3b78",
    storageBucket: "sekeyrity-c3b78.appspot.com",
    messagingSenderId: "874280357227",
    appId: "1:874280357227:web:923dea5aa88fc115f0102e",
    measurementId: "G-8PE4BP9MPG"
  };
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    import{getDatabase, ref, child, get, set, update, remove} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const db = getDatabase();
// Create a reference to the root of the database
const ref_root = ref(db, "/");

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


function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

window.get_signup_info = function(){
 let nickname = document.getElementById('nickname').value;
  let user_email = document.getElementById('emailInput').value;
  let password = document.getElementById('passwordInput').value;
  let cpassword = document.getElementById('cpasswordInput').value;

  let messageElement = document.getElementById('insert_info_message'); //placeholder da mensagem por cima dos campos de inserção
  //verificar se todos os campos têm valores
  if(user_email === "" || password === "" || cpassword === ""){
    messageElement.textContent = "Please fill in all fields."; // Set the message content
    return;
  }

  
  //verificar se o email é válido
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if the email matches the pattern, if not it returns false
  if (emailPattern.test(user_email) == false) {
    messageElement.textContent = "Invalid e-mail."; 
    return;
  }          

  
  //dar hash às passwords, mesmo assim nao está totalmente seguro!! este código corre no browser do cliente, devia correr no lado do servidor (adicionava mais complexidade)  
  const hashedPassword = hashPassword(password);
  const hashedcPassword = hashPassword(cpassword);
  
  //verificar se são iguais
  if(hashedPassword != hashedcPassword){
      messageElement.textContent = "The passwords have to match."; 
      return;
  }
   
  //se passarmos todos estas verificações já podemos alterar as informações na base de dados

  // Update the default user's password, email, and node name, para fazer isto vamos copiar o conteudo de default para outro no e apagar o default
  get(child(ref_root, 'users/default')).then((snapshot) => {
    if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Set the data under the new nickname
        set(child(ref_root, 'users/' + nickname), userData).then(() => {
            // New nickname node created successfully, now remove the old 'default' node
            remove(child(ref_root, 'users/default')).then(() => {
                // Default user node removed successfully
                // Update the email and password under the new nickname
                update(ref_root, {
                    ['users/' + nickname + '/e-mail']: user_email,
                    ['users/' + nickname + '/password']: hashedPassword
                }).then(() => {
                    // Email and password updated successfully under the new nickname
                    // After all operations complete successfully, redirect the user
                    //passar para a janela onde se pedem as permissões 
                    const user = {
                      email: user_email,
                      isAdmin: 0,
                      username: nickname
                    };
                    sessionStorage.setItem('currentUser', JSON.stringify(user)) ;


                    window.location.href = "user_key_req.html";
                }).catch((error) => {
                    console.error("Error updating email and password:", error);
                });
            }).catch((error) => {
                console.error("Error removing default user node:", error);
            });
        }).catch((error) => {
            console.error("Error setting data under new nickname:", error);
        });
    } else {
        console.error("User data for 'default' node does not exist.");
    }
}).catch((error) => {
    console.error("Error getting user data:", error);
});

 
} 



//Enviar email

      /*
      const express = require('express');
      const nodemailer = require('nodemailer');
      const bodyParser = require('body-parser');

      const PORT = process.env.PORT || 3000;

      // Configurar o nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sekeyrity@gmail.com',
          pass: 'eletrocap2324pic1'
        }
      });

      // Configurar o body-parser
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(bodyParser.json());

      // Rota para lidar com o envio de e-mails
      app.post('/send-email', (req, res) => {
        const { name, email, subject, message } = req.body;

        const mailOptions = {
          from: email, // Usar o endereço de e-mail fornecido pelo usuário como remetente
          to: 'sekeyrity@gmail.com', // Endereço de e-mail para onde os e-mails serão enviados
          subject: subject,
          text: `Nome: ${name}\nE-mail: ${email}\nMensagem: ${message}`
        };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            res.status(500).send('Ocorreu um erro ao enviar o e-mail.');
          } else {
            console.log('E-mail enviado: ' + info.response);
            res.send('Obrigado por entrar em contato! Seu e-mail foi enviado com sucesso.');
          }
        });
      });

      app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
      });*/



//funcao que processa dados do login
window.process_login = function(){
  let email = document.getElementById("login_email").value;
  let plainPassword = document.getElementById("login_password").value;
  let messageElement = document.getElementById('login_message');
  let authenticated = false;

  //temos de dar hash à password para ser possivel comparar com as da base de dados
  const hashedPassword = hashPassword(plainPassword);

  //varrer a base de dados à procura do email e comparar a pass.
  
  // Reference to the 'users' node in the database
  const usersRef = ref(db, '/users');

  // Retrieve the data under 'users'
  get(usersRef).then((snapshot) => {
    if (snapshot.exists()) {
      //loop por todos os users
      snapshot.forEach((childSnapshot) => {
        let userData = childSnapshot.val();
        let storedEmail = userData['e-mail'];
        let storedPassword = userData.password; 
        let username = childSnapshot.key; // Retrieve the node's name (username)
        // Compare the stored email with the provided email
        if (email === storedEmail) {
          // Email match, now compare the password
          if (hashedPassword === storedPassword) {
            // User autenticado, passar para a próxima página, guardar o user que foi autenticado
            let isAdmin = userData.admin; //verificar se é admin
            authenticated = true; // Set flag to true


            //GUARDAR AS INFOS DO USER AUTENTICADO no storage da sessao
            const user = {
                email: email,
                isAdmin: isAdmin,
                username: username
            };
            sessionStorage.setItem('currentUser', JSON.stringify(user)) ;
            //PARA RECUPERAR NOUTROS SITIOS: const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

              
            if(isAdmin === 1){
              // redirecionar para a página dos admins
              window.location.href = "admin_give_acess.html"; 
              return;
            }else{
              //redirecionar para a página dos users normais
              window.location.href = "user_key_req.html";
              return;  

            }
            
          }
        }
      });

      // No matching email found
      // Check authentication flag
      if (!authenticated) {
        messageElement.textContent = "E-mail or password wrong.";
      }
    } else {
      // No users found in the database
      messageElement.textContent = "E-mail or password wrong.";
    }


  });

}

window.process_key_request = function(){
  

  // Get all checkboxes by their IDs
  let key1Checkbox = document.getElementById("task1");
  let key2Checkbox = document.getElementById("task2");
  let key3Checkbox = document.getElementById("task3");
  let key4Checkbox = document.getElementById("task4");
  let messageholder = document.getElementById("key_request_text");

  // Check if each checkbox is checked
  let key1Checked = key1Checkbox.checked;
  let key2Checked = key2Checkbox.checked;
  let key3Checked = key3Checkbox.checked;
  let key4Checked = key4Checkbox.checked;  

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  let username = currentUser.username;

  //temos de criar um no na base de dados chamado key_request onde as request sao identificadas pelo username 

  let topic = {
      key1: key1Checked,
      key2: key2Checked,
      key3: key3Checked,
      key4: key4Checked
  };

// Reference to the Firebase database
const ref_root = ref(db, "/");

 // Create a new node named "key_request" and store the topic under it
    let updates = {};
    updates['/key_request/' + username] = topic;



    // Perform the update
    update(ref_root, updates)
        .then(() => {
            messageholder.textContent = "Request successfull";
        })
        .catch((error) => {
            console.error("Error registering topic:", error);
        });
}

window.userlogged = function(){
  let messageElement = document.getElementById('logged');
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  messageElement.textContent =currentUser.username;
}
