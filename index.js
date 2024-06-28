// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

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

  sessionStorage.setItem('codeString', codeString); //guardar para ser usado noutra funcao

  const default_user = child(ref_root, 'users/default' + codeString);

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
    messageElement.textContent = "Incorrect code. Please scan your card again."; // Set the message content
  }
}).catch((error) => {
  console.error("Error reading default user:", error);
});
}


function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

window.get_signup_info = function(){
  let codeString = sessionStorage.getItem('codeString');    //código do user, sacado na funcao code_submited
  let nickname = document.getElementById('nickname').value;
  let user_email = document.getElementById('emailInput').value;
  let password = document.getElementById('passwordInput').value;
  let cpassword = document.getElementById('cpasswordInput').value;

  let returnflag = 0;

  let messageElement = document.getElementById('insert_info_message'); //placeholder da mensagem por cima dos campos de inserção
  //verificar se todos os campos têm valores
  if(user_email === "" || password === "" || cpassword === "" || nickname === ""){
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
    
      
  // Verifying if the username already exists in the database
  get(child(ref_root, 'users/' + nickname)).then((snapshot) => {
    if (snapshot.exists && snapshot.val() != null) {
      // If the username already exists, prompt the user to choose another
      //console.log("USER EXISTE" + nickname);
      //const data = snapshot.val();
      //console.log(data)
      messageElement.textContent = "Username already taken, choose another."; 
      return; // Exit the function if username exists
    } else {
      // Proceed with the rest of the function if username doesn't exist

      //se passarmos todos estas verificações já podemos alterar as informações na base de dados
      // Update the default user's password, email, and node name
      get(child(ref_root, 'users/default' + codeString)).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          // Set the data under the new nickname
          set(child(ref_root, 'users/' + nickname), userData).then(() => {
            // New nickname node created successfully, now remove the old 'default' node
            remove(child(ref_root, 'users/default' + codeString)).then(() => {
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
                sessionStorage.setItem('currentUser', JSON.stringify(user));
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
          messageElement.textContent = "[Error] Please scan your card again."; // Set the message content
          console.error("User data for 'default"+ codeString+ "' node does not exist.");
        }
      }).catch((error) => {
        console.error("Error getting user data:", error);
      });
    }
  }).catch((error) => {
    console.error("Error getting user data:", error);
  });

 
} 

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
              window.location.href = "admin_acess_managment.html"; 
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
  

  
  const checkboxToKeyMap = {
    "task1": "key-01",
    "task2": "key-02",
    "task3": "key-03",
    "task4": "key-04"
  };
 let messageholder = document.getElementById("key_request_text");

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  let username = currentUser.username;

  // Get the current timestamp from the browser
  let timestamp = new Date(Date.now());

  // Format timestamp to dd/mm/yyyy
  let formattedDay = timestamp.getDate().toString().padStart(2, '0');
  let formattedMonth = (timestamp.getMonth() + 1).toString().padStart(2, '0');
  let formattedYear = timestamp.getFullYear();
  let formattedTimestamp = `${formattedDay}/${formattedMonth}/${formattedYear}`;

  let topic={
    timestamp: formattedTimestamp
  }
  
  Object.entries(checkboxToKeyMap).forEach(([checkboxId, key]) => {
    let checkbox = document.getElementById(checkboxId);
    
    if (checkbox.checked) {
      topic[key] = true;
    }
  });

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

window.displayKeyRequests = function(){
  // Reference to the key requests node in Firebase
  const keyRequestsRef = ref(db,"key_request");
  const requestsContainer = document.getElementById("requests-container");

  // Fetch key requests from Firebase using get()
  get(keyRequestsRef).then((snapshot) => {
    // Clear previous requests from the container
    requestsContainer.innerHTML = "";

    // Iterate through each key request
    snapshot.forEach((childSnapshot) => {
      const username = childSnapshot.key;
      const requestData = childSnapshot.val();


        // Filter keys with true values
        const requestedKeys = Object.keys(requestData).filter(key => requestData[key] === true);

        // If user has no requested keys, skip to next user
        if (requestedKeys.length === 0) {
            return;
        }

        // Create elements for each request
        const whiteBox = document.createElement("div");
        whiteBox.className = "white-box";

        const boxContent = document.createElement("div");
        boxContent.className = "box-content";

        const userName = document.createElement("div");
        userName.textContent = "User: " + username;
        boxContent.appendChild(userName); // Add username to box content

        // Loop through requested keys and display them on new lines
        requestedKeys.forEach(key => {
            const keyDescription = document.createElement("div");
            keyDescription.textContent = key;
            boxContent.appendChild(keyDescription);

            // Create accept button
            const acceptButton = document.createElement("button");
            acceptButton.textContent = "Accept";
            acceptButton.className = "buttons";

            //onclick logic
            acceptButton.onclick = () => {
                const userRef = ref(db,"users/" + username + "/" + key);
                set(userRef, true)
                    .then(() => {
                        console.log("Key", key, "accepted for user", username);
                        // Remove the key request
                        const keyRequestRef = ref(db,"key_request/" + username + "/" + key);
                        remove(keyRequestRef)
                            .then(() => {
                                console.log("Key request removed");
                            })
                            .catch((error) => {
                                console.error("Error removing key request:", error);
                            });
                    })
                    .catch((error) => {
                        console.error("Error accepting key:", error);
                    })

            };
            boxContent.appendChild(acceptButton);

            // Create reject button
            const rejectButton = document.createElement("button");
            rejectButton.textContent = "Reject";
            rejectButton.className = "buttons";
            rejectButton.onclick = () => {
                // Handle reject logic here
                const userRef = ref(db,"users/" + username + "/" + key);
                set(userRef, false)
                    .then(() => {
                        console.log("Key", key, "rejected for user", username);
                        // Remove the key request
                        const keyRequestRef = ref(db,"key_request/" + username + "/" + key);
                        remove(keyRequestRef)
                            .then(() => {
                                console.log("Key request removed");
                            })
                            .catch((error) => {
                                console.error("Error removing key request:", error);
                            });
                    })
                    .catch((error) => {
                        console.error("Error rejected key:", error);
                    })


                console.log("Rejected key:", key);

            };
            boxContent.appendChild(rejectButton);

            // Add line break after key and buttons
            boxContent.appendChild(document.createElement("br"));
          });

            const requestDate = document.createElement("div");
            requestDate.textContent = "Request Date: " + requestData.timestamp;

            whiteBox.appendChild(boxContent);
            whiteBox.appendChild(requestDate);
            requestsContainer.appendChild(whiteBox);
        });
    }).catch((error) => {
        console.error("Error getting key requests: ", error);
    });

}

//Função que gere todos os acessos de cada user
window.remove_and_give_acess = function(){
  // Reference to the key requests node in Firebase
  const users = ref(db,"users");
  const requestsContainer = document.getElementById("acess-managment");

  // Fetch key requests from Firebase using get()
  get(users).then((snapshot) => {
    // Clear previous requests from the container
    requestsContainer.innerHTML = "";
    
    
    //Iterate through each users
    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val();
      const username = childSnapshot.key; 
      //console.log(userData);
      // Create elements for acess managment
      const whiteBox = document.createElement("div");
      whiteBox.className = "box-admin-acess-managment";

      const boxContent = document.createElement("div");
      boxContent.className = "content-box-admin-acess-managment";

      const userName = document.createElement("div");
      userName.textContent = "User: " + username;
      boxContent.appendChild(userName); // Add username to box content

      // Iterate through each user data
      Object.entries(userData).forEach(([key, value]) => {
        // Check data is a key
        if (key.startsWith("key-")) {
         
          const keyDescription = document.createElement("div");
          keyDescription.textContent = key;
          boxContent.appendChild(keyDescription);

           

          //button com give acess ou remove acess
          if (value) {
            // Create button
            const button = document.createElement("button");
            button.className = "remove-acess-button";

            button.textContent = "Remove Acess";
            button.addEventListener("click", () => {
                // lógica para remover o acesso aqui
                const userRef = ref(db,"users/" + username + "/" + key);
                set(userRef, false)
                location.reload();
             });
          boxContent.appendChild(button);
          } else {
            // Create button
            const button = document.createElement("button");
            button.className = "give-acess-button";

            button.textContent = "Give Acess";
            button.addEventListener("click", () => {
              // lógica para conceder o acesso aqui
              const userRef = ref(db,"users/" + username + "/" + key);
              set(userRef, true)
              location.reload();
            });
           boxContent.appendChild(button);
    }
        }
      })
      whiteBox.appendChild(boxContent);
      requestsContainer.appendChild(whiteBox);

    })
  }).catch((error) => {
    console.error("Error getting users: ", error);
  });


}

//Função para aparecer jºa certos nas chaves a que tem acesso
window.markAccesKey = function(){

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  let username = currentUser.username;
  const ref_root = ref(db, "/users/");
  const userRef = child(ref_root, username);

  get(userRef).then((snapshot) => {

    if (snapshot.exists()) {

      let keys = ["key-01", "key-02", "key-03", "key-04"];
      let check = ["task1", "task2" , "task3", "task4"];

      keys.forEach((key, index) => {
        let checkbox = document.getElementById(check[index]);
        if (snapshot.val() && snapshot.val()[key] === true) {
          checkbox.checked = true;
          //checkbox.disabled = true;
        }
      });
    } else {
      console.log("No data available");
    }
  });

 
}

window.userlogged = function(){
  let messageElement = document.getElementById('logged');
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  messageElement.textContent =currentUser.username;
}


function formatDateTime(input) {
    // Split the date and time parts
    let [datePart, timePart] = input.split(' : ');

    // Further split the time part into components
    let timeComponents = timePart.split('-');

    // Get the hours and minutes
    let hours = timeComponents[0];
    let minutes = timeComponents[1];

    // Construct the new time string in the desired format
    let formattedTime = `${hours}h${minutes}m`;

    // Combine the date and new time format
    let formattedDateTime = `${datePart}: ${formattedTime}`;

    return formattedDateTime;
}



window.display_key_movements = function() {
    // Initialize EmailJS with your user ID
    emailjs.init('_StS_RLq9GmYdsKr4');

    // Reference to the movements node in Firebase
    const movementsRef = ref(db, "movements");
    const movementsContainer = document.getElementById("movements-container");

    // Fetch movements from Firebase using get()
    get(movementsRef).then((snapshot) => {
        // Clear previous movements from the container
        movementsContainer.innerHTML = "";

        // Collect movements in an array
        let movements = [];

        // Iterate through each movement and collect data
        snapshot.forEach((childSnapshot) => {
            const timestamp = childSnapshot.key;
            const movementData = childSnapshot.val();
            movements.push({ timestamp, movementData });
        });

        // Reverse the array to display the most recent movements at the top
        movements.reverse();

        // Append each movement to the container in the reversed order
        movements.forEach(({ timestamp, movementData }) => {
            // Create elements for each movement
            const whiteBox = document.createElement("div");
            whiteBox.className = "white-box";

            const boxContent = document.createElement("div");
            boxContent.className = "box-content";

          

            // Extract movement details
            const { username, key_id, take_key, return_key, return_time } = movementData;

            // Display username and key ID
            const userName = document.createElement("div");
            userName.textContent = "User: " + username;
            boxContent.appendChild(userName);

            const keyId = document.createElement("div");
            keyId.textContent = "Key ID: " + key_id;
            boxContent.appendChild(keyId);

            const movementTimestamp = document.createElement("div");
            movementTimestamp.textContent = "Was taken at: " + formatDateTime(timestamp);
            boxContent.appendChild(movementTimestamp); // Add timestamp to box content

            // Determine the type of movement
            let movementType = "";
            const movementTypeElement = document.createElement("div");
            
            if (return_key && take_key) {
                movementType = "Take and respective return";
                movementTypeElement.textContent = "Movement Type: " + movementType;
                // Display return time
                const movementReturnTime = document.createElement('div');
                movementReturnTime.textContent = "Was returned at: " + formatDateTime(return_time); 
                boxContent.appendChild(movementReturnTime);
            } else if (take_key) {
                movementType = "Take";
                movementTypeElement.textContent = "Movement Type: " + movementType;
            }
            
            boxContent.appendChild(movementTypeElement);

            // Add "notify" button if movement type is "take"
            if (movementType === "Take") {
                const notifyButton = document.createElement("button");
                notifyButton.textContent = "Notify";
                notifyButton.className = "notify-button";
                notifyButton.onclick = function() {
                    // Reference to the user in Firebase
                    let userRef = ref(db, "users/" + username);
                    get(userRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            let userData = snapshot.val();
                            let userEmail = userData['e-mail'];

                            // Send email using EmailJS
                            emailjs.send('service_civza6t', 'template_pfno3fu', {
                                to_name: username,
                                from_name: 'Sekeyrity',
                                message: 'Hi '+ username + ' please return the '+ key_id +'.',
                                to_email: userEmail
                            }).then((response) => {
                                console.log('Email sent successfully:' + userEmail, response);
                            }).catch((error) => {
                                console.error('Error sending email:' + userEmail, error);
                            });
                        } else {
                            console.log("No data available");
                        }
                    });
                };
                boxContent.appendChild(notifyButton);
            }

            // Add line break after each movement
            boxContent.appendChild(document.createElement("br"));

            whiteBox.appendChild(boxContent);
            movementsContainer.appendChild(whiteBox);
        });
    }).catch((error) => {
        console.error("Error getting movements: ", error);
    });
};


  
