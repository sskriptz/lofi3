// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwUAqTV07AahyfD55owmyAcxDG3TP_KnI",
  authDomain: "lofi-168cb.firebaseapp.com",
  projectId: "lofi-168cb",
  storageBucket: "lofi-168cb.firebasestorage.app",
  messagingSenderId: "331670095312",
  appId: "1:331670095312:web:7538041673a10b1b4aa5d5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentChatUser = null;
let messageListener = null;

document.addEventListener("DOMContentLoaded", () => {

    // Create the welcome panel element and style it dynamically (Frosted glass effect)
    const welcomePanel = document.createElement("div");
    welcomePanel.id = "welcome-panel";
    welcomePanel.style.position = "absolute"; // Absolute positioning to position it relative to the page
    welcomePanel.style.top = "-100px"; // Start off-screen
    welcomePanel.style.background = "rgba(255, 255, 255, 0.8)"; // Reduced transparency for frosted glass effect
    welcomePanel.style.borderRadius = "15px"; // Rounded corners
    welcomePanel.style.border = "3px solid rgba(0, 0, 0, 0.7)"; // Increased thickness of black border
    welcomePanel.style.padding = "20px";
    welcomePanel.style.fontSize = "18px";
    welcomePanel.style.textAlign = "center";
    welcomePanel.style.width = "80%";
    welcomePanel.style.maxWidth = "400px";
    welcomePanel.style.zIndex = "9999"; // On top of everything else
    welcomePanel.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.3)"; // Soft shadow for depth
    welcomePanel.style.transition = "top 0.5s ease, opacity 0.3s ease, transform 0.3s ease"; // Smooth animation
    welcomePanel.style.opacity = "0"; // Start as invisible
    welcomePanel.style.fontFamily = "'Inconsolata', monospace"; // Inconsolata font
    welcomePanel.style.backdropFilter = "blur(15px)"; // Frosted glass effect
    document.body.appendChild(welcomePanel);
    
    // Create the welcome message paragraph (Text in white)
    const welcomeMessage = document.createElement("p");
    welcomeMessage.style.color = "black"; // Ensure the text is white
    welcomePanel.appendChild(welcomeMessage);
    
    // Create the continue button for the panel
    const closePanelBtn = document.createElement("button");
    closePanelBtn.textContent = "Continue";
    closePanelBtn.style.background = "#333333"; // Dark background for button
    closePanelBtn.style.border = "2px solid transparent"; // Initially no border
    closePanelBtn.style.color = "white";
    closePanelBtn.style.fontSize = "20px";
    closePanelBtn.style.marginTop = "20px";
    closePanelBtn.style.cursor = "pointer";
    closePanelBtn.style.padding = "12px 30px"; // More padding for a rectangular button
    closePanelBtn.style.borderRadius = "8px"; // Curved edges
    closePanelBtn.style.transition = "background-color 0.3s ease, border-color 0.3s ease";
    closePanelBtn.style.fontWeight = "bold";
    closePanelBtn.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    welcomePanel.appendChild(closePanelBtn);
    
    // Hover effect for button: border and color change
    closePanelBtn.onmouseover = () => {
        closePanelBtn.style.borderColor = "#ffffff"; // Border shows up on hover
        closePanelBtn.style.backgroundColor = "#555555"; // Darker background on hover
    };
    closePanelBtn.onmouseout = () => {
        closePanelBtn.style.borderColor = "transparent"; // No border on mouse out
        closePanelBtn.style.backgroundColor = "#333333"; // Original background
    };
    
    // Hover effect for the panel itself: subtle brightness increase
    welcomePanel.onmouseover = () => {
        welcomePanel.style.transform = "translateX(-50%) scale(1.05)"; // Slight scale-up
        welcomePanel.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.4)"; // Increase shadow on hover
    };
    welcomePanel.onmouseout = () => {
        welcomePanel.style.transform = "translateX(-50%) scale(1)"; // Return to normal scale
        welcomePanel.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.3)"; // Return to original shadow
    };
    
    // Add CSS for hover animation
    const style = document.createElement('style');
    style.innerHTML = 
        `@keyframes hoverUpDown {
            0% { transform: translateY(0); }
            50% { transform: translateY(10px); }
            100% { transform: translateY(0); }
        }`;
    document.head.appendChild(style);


    // Check if the user is new or returning
    function checkIfNewUser(user) {
        const creationTime = user.metadata.creationTime;
        const lastSignInTime = user.metadata.lastSignInTime;
    
        if (creationTime === lastSignInTime) {
            // New user
            welcomeMessage.innerHTML = `Welcome, ${user.displayName}!`;
        } else {
            // Returning user
            welcomeMessage.innerHTML = `Welcome back, ${user.displayName}!`;
        }
    
        // Delay the animation of the welcome panel
        setTimeout(() => {
            // Show the welcome panel with slide-down animation
            welcomePanel.style.opacity = "1"; // Make the panel visible
            welcomePanel.style.top = "20px"; // Slide the panel down smoothly
            // Apply the hover animation
            welcomePanel.style.animation = "hoverUpDown 3s infinite ease-in-out"; // Infinite up and down animation
        }, 500); // Delay by 500ms
    }


    // Close the welcome panel
    closePanelBtn.onclick = () => {
        welcomePanel.style.top = "-100px"; // Hide the panel again
        welcomePanel.style.opacity = "0"; // Make it invisible again
    
        // After the panel is completely out of view, set it to display none
        setTimeout(() => {
            welcomePanel.style.display = "none"; // Remove the panel from the view
        }, 500); // Match the transition duration
    };




    auth.onAuthStateChanged(async (user) => {
        if (user) {
            checkIfNewUser(user);
        } else {
            // If user is not signed in, redirect to index page
            window.location.href = "index.html";
            return;
        }

        // Rest of your existing landing page auth code
        document.getElementById('chatContainer').style.display = 'none';
        currentChatUser = null;
        if (messageListener) {
            messageListener();
            messageListener = null;
        }

        // ----------------- UPDATE USER INFO -----------------





        const userDoc = await db.collection('users').doc(user.uid).get();
        
        const profilePicElement = document.getElementById('userProfilePic');
        if (user.photoURL) {
            profilePicElement.src = user.photoURL;
        } else {
            profilePicElement.src = 'https://www.gravatar.com/avatar/?d=mp';
        }





        // Update user info display
        const userInfo = document.getElementById('user-info');
        userInfo.innerHTML = `
            <img src="${user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'}" 
                 alt="Profile" 
                 width="50" 
                 style="border-radius: 50%">
            <p>Hello, ${user.displayName}</p>
        `;






        const profileUserInfo = document.getElementById("pp-user-info");
        profileUserInfo.innerHTML = `
            <img src="${user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'}" 
                 alt="Profile" 
                 width="50" 
                 style="border-radius: 50%">
            <p>${user.displayName}</p>
        `;






        const accCreationDateP = document.getElementById("acc-creation-date");

        // Function to format the date
        function formatDate(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleDateString("en-US", {  
                year: "numeric",  
                month: "long",  
                day: "numeric"  
            });
        }

        if (user) {
            const creationTimestamp = user.metadata.creationTime;
            if (creationTimestamp) {
                accCreationDateP.textContent = `Account Created On: ${formatDate(creationTimestamp)}`;
            } else {
                accCreationDateP.textContent = "Creation date not available.";
            }
        }






        // -----------------------------------------------

        if (!userDoc.exists) {
            // Create new user document with Google display name
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                username: user.displayName,
                friends: [],
                friendRequests: [],
                profilePicture: user.photoURL || null
            });
            document.getElementById('userUsername').textContent = user.displayName;
        } else {
            document.getElementById('userUsername').textContent = userDoc.data().username;
        }

        // Show main section
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('usernameSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        loadFriendRequests();
        loadFriends();
        setupSearchListener();



        // Retrieve the "About Me" text when the user is signed in
        if (user) {
            // Fetch the user's "About Me" from Firestore
            db.collection("users").doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    // Display the saved "About Me" text if it exists
                    aboutMeOfficialP.textContent = doc.data().aboutMe || "You haven't set an About Me yet.";
                } else {
                    aboutMeOfficialP.textContent = "You haven't set an About Me yet.";
                }
            })
            .catch(error => {
                console.error("Error fetching About Me:", error);
            });
        }


        // Retrieve the "Socials" text when the user is signed in

        if (user) {
            db.collection("users").doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    socialsOfficialP.innerHTML = (doc.data().socials || "You haven't set your Socials yet.").replace(/\n/g, "<br>");
                } else {
                    socialsOfficialP.innerHTML = "You haven't set your Socials yet.";
                }
            })
            .catch(error => {
                console.error("Error fetching Socials:", error);
            });
        }
    });

    // Get the input and save button elements for username change
    const usernameInput = document.getElementById("username-input"); // The input field for the new username
    const usernameSaveBtn = document.getElementById("username-save-btn"); // The save button
    
    // Function to handle username change
    function changeUsername() {
        const newUsername = usernameInput.value; // Get the value from the input field
    
        if (newUsername) {
            const user = auth.currentUser;
            user.updateProfile({
                displayName: newUsername
            }).then(() => {
                alert("Username updated successfully!");
                window.location.reload(true);
                // Update UI to reflect new username
                userInfo.innerHTML = `<img src="${user.photoURL}" width="50" style="border-radius:50%"><p>Hello, ${user.displayName}</p>`;
                profilePanelUserInfo.innerHTML = `<img src="${user.photoURL}" width="50" style="border-radius:50%"><p>${user.displayName}</p>`;
            }).catch(error => {
                console.error("Error updating username:", error);
            });
        } else {
            console.log("Username cannot be empty");
        }
    }
    
    // Add event listener for the save button to trigger the change
    usernameSaveBtn.addEventListener("click", changeUsername); 


    // Get elements for "About Me"
    const aboutMeInput = document.getElementById("aboutme-input");
    const aboutMeSaveBtn = document.getElementById("aboutme-save-btn");
    const aboutMeOfficialP = document.getElementById("aboutme-official-p");


    const maxLines = 5;  // Set the maximum number of lines allowed


    aboutMeInput.addEventListener("input", () => {
        const lines = aboutMeInput.value.split("\n"); // Split the value into lines by newline characters
        
        if (lines.length > maxLines) {
            // If the number of lines exceeds maxLines, limit the textarea to maxLines
            // We only keep the first `maxLines` lines and join them back into a string
            aboutMeInput.value = lines.slice(0, maxLines).join("\n");
        }
    });


    // Function to save the About Me content to Firestore
    function saveAboutMe() {
        const aboutMeText = aboutMeInput.value.trim(); // Get and trim the input text
        const user = firebase.auth().currentUser; // Get the current user

        if (user && aboutMeText) {
            // Save the text to Firestore under the user's document
            db.collection("users").doc(user.uid).set({
                aboutMe: aboutMeText
            }, { merge: true }) // Use merge to only update the aboutMe field without overwriting the entire document
            .then(() => {
                alert("About Me saved successfully!");
                // Update the "About Me" text in the HTML immediately
                aboutMeOfficialP.textContent = aboutMeText;
                aboutMeInput.value = ''; // Clear the input field
            })
            .catch(error => {
                console.error("Error saving About Me:", error);
            });
        } else {
            console.log("About Me is empty or user not signed in");
        }
    }

    // Add event listener to the save button
    aboutMeSaveBtn.addEventListener("click", saveAboutMe);



    // Get elements for "Socials"
    const socialsInput = document.getElementById("socials-input");
    const socialsSaveBtn = document.getElementById("socials-save-btn");
    const socialsOfficialP = document.getElementById("socials-official-p");

    const maxSocialLines = 5; // Limit the number of lines for Socials

    socialsInput.addEventListener("input", () => {
        const lines = socialsInput.value.split("\n");

        if (lines.length > maxSocialLines) {
            socialsInput.value = lines.slice(0, maxSocialLines).join("\n");
        }
    });

    // Function to save the Socials content to Firestore
    function saveSocials() {
        const socialsText = socialsInput.value.trim();
        const user = firebase.auth().currentUser;

        if (user && socialsText) {
            db.collection("users").doc(user.uid).set({
                socials: socialsText
            }, { merge: true }) // Only update socials field without overwriting the whole document
            .then(() => {
                alert("Socials saved successfully!");
                socialsOfficialP.innerHTML = socialsText.replace(/\n/g, "<br>"); // Preserve line breaks
                socialsInput.value = ''; // Clear the input field
            })
            .catch(error => {
                console.error("Error saving Socials:", error);
            });
        } else {
            console.log("Socials is empty or user not signed in");
        }
    }

    // Add event listener to the save button
    socialsSaveBtn.addEventListener("click", saveSocials);
});


// Authentication functions
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
        alert(error.message);
    }
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert(error.message);
    }
}

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            if (!user.displayName) {
                // If for some reason there's no display name, use email without the domain
                const username = user.email.split('@')[0];
                return db.collection('users').doc(user.uid).set({
                    email: user.email,
                    username: username,
                    friends: [],
                    friendRequests: [],
                    profilePicture: user.photoURL || null
                });
            }
        })
        .catch((error) => {
            alert(error.message);
        });
}

function signOut() {
    // Clear chat container and reset chat state
    document.getElementById('chatContainer').style.display = 'none';
    currentChatUser = null;
    
    // Remove message listener if it exists
    if (messageListener) {
        messageListener();  // If it's a function, you call it like this
        messageListener = null;  // Reset listener
    } else if (messageListener && typeof messageListener === 'function') {
        firebase.database().ref('messages').off('child_added', messageListener); // Detach the Firebase listener
    }

    auth.setPersistence(firebase.auth.Auth.Persistence.NONE).then(() => {
        auth.signOut().then(() => {
            // After signing out, redirect to the index page
            window.location.href = "index.html";  // Redirect to index.html after sign-out
        }).catch(error => console.error("Sign-out error:", error));
    }).catch(error => console.error("Error clearing persistence:", error));
}


function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    let timeout = null;

    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm.length > 2) {
                searchUsers(searchTerm);
            } else {
                document.getElementById('searchResults').innerHTML = '';
            }
        }, 500);
    });
}

async function searchUsers(searchTerm) {
    const currentUser = auth.currentUser;
    const currentUserDoc = await db.collection('users').doc(currentUser.uid).get();
    const currentUserData = currentUserDoc.data();
    const currentUserFriends = currentUserData.friends || [];
    
    const usersRef = db.collection('users');
    // Get all users and filter client-side for better partial matches
    const snapshot = await usersRef.get();
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    snapshot.forEach(doc => {
        const userData = doc.data();
        // Check if username contains search term (case insensitive)
        if (
            userData.username.toLowerCase().includes(searchTerm.toLowerCase()) && // Matches anywhere in username
            doc.id !== currentUser.uid // Not the current user
        ) {
            const isAlreadyFriend = currentUserFriends.some(friend => friend.userId === doc.id);
            const hasPendingRequest = currentUserData.friendRequests?.some(
                request => request.userId === doc.id && request.status === 'pending'
            );
            
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${userData.profilePicture || 'https://www.gravatar.com/avatar/?d=mp'}" 
                        alt="Profile" 
                        style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <span>${userData.username}</span>
                </div>
                ${
                    isAlreadyFriend ? '<button disabled>Already Friends</button>' : 
                    hasPendingRequest ? '<button disabled>Request Pending</button>' :
                    `<button onclick="sendFriendRequest('${doc.id}')">Send Friend Request</button>`
                }
            `;
            searchResults.appendChild(userCard);
        }
    });
}

async function sendFriendRequest(targetUserId) {
    const currentUser = auth.currentUser;
    
    // Additional safety check to prevent self-friend requests
    if (targetUserId === currentUser.uid) {
        alert('You cannot send a friend request to yourself!');
        return;
    }
    
    try {
        const currentUserDoc = await db.collection('users').doc(currentUser.uid).get();
        const currentUserData = currentUserDoc.data();
        const targetUserDoc = await db.collection('users').doc(targetUserId).get();
        const targetUserData = targetUserDoc.data();

        // Check if already friends
        const isAlreadyFriend = currentUserData.friends?.some(friend => friend.userId === targetUserId);
        if (isAlreadyFriend) {
            alert('You are already friends with this user!');
            return;
        }

        // Check if friend request already sent
        const requestAlreadySent = targetUserData.friendRequests?.some(
            request => request.userId === currentUser.uid && request.status === 'pending'
        );
        if (requestAlreadySent) {
            alert('Friend request already sent!');
            return;
        }

        const targetUserRef = db.collection('users').doc(targetUserId);
        await targetUserRef.update({
            friendRequests: firebase.firestore.FieldValue.arrayUnion({
                userId: currentUser.uid,
                username: currentUserData.username,
                status: 'pending'
            })
        });

        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('searchInput').value = '';
        alert('Friend request sent!');
    } catch (error) {
        alert('Error sending friend request: ' + error.message);
    }
}

async function loadFriendRequests() {
    const currentUser = auth.currentUser;
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    const notifications = document.getElementById('notifications');
    notifications.innerHTML = '';

    if (userData.friendRequests && userData.friendRequests.length > 0) {
        for (const request of userData.friendRequests) {
            if (request.status === 'pending') {
                // Fetch requester's current data to get their up-to-date profile picture
                const requesterDoc = await db.collection('users').doc(request.userId).get();
                const requesterData = requesterDoc.data();
                
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <img src="${requesterData.profilePicture || 'https://www.gravatar.com/avatar/?d=mp'}" 
                            alt="Profile" 
                            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                        <p>Friend request from ${request.username}</p>
                    </div>
                    <div>
                        <button onclick="acceptFriendRequest('${request.userId}')">Accept</button>
                        <button onclick="rejectFriendRequest('${request.userId}')">Reject</button>
                    </div>
                `;
                notifications.appendChild(notification);
            }
        }
    }
}

async function acceptFriendRequest(requesterId) {
    const currentUser = auth.currentUser;
    const currentUserRef = db.collection('users').doc(currentUser.uid);
    const requesterRef = db.collection('users').doc(requesterId);

    try {
        const currentUserDoc = await currentUserRef.get();
        const requesterDoc = await requesterRef.get();
        const currentUserData = currentUserDoc.data();
        const requesterData = requesterDoc.data();

        // Add to current user's friends list
        await currentUserRef.update({
            friends: firebase.firestore.FieldValue.arrayUnion({
                userId: requesterId,
                username: requesterData.username
            }),
            friendRequests: firebase.firestore.FieldValue.arrayRemove({
                userId: requesterId,
                username: requesterData.username,
                status: 'pending'
            })
        });

        // Add to requester's friends list
        await requesterRef.update({
            friends: firebase.firestore.FieldValue.arrayUnion({
                userId: currentUser.uid,
                username: currentUserData.username
            })
        });

        loadFriendRequests();
        loadFriends();
    } catch (error) {
        alert('Error accepting friend request: ' + error.message);
    }
}

async function rejectFriendRequest(requesterId) {
    const currentUser = auth.currentUser;
    const currentUserRef = db.collection('users').doc(currentUser.uid);
    const requesterRef = db.collection('users').doc(requesterId);

    try {
        const requesterDoc = await requesterRef.get();
        await currentUserRef.update({
            friendRequests: firebase.firestore.FieldValue.arrayRemove({
                userId: requesterId,
                username: requesterDoc.data().username,
                status: 'pending'
            })
        });
        loadFriendRequests();
    } catch (error) {
        alert('Error rejecting friend request: ' + error.message);
    }
}

async function loadFriends() {
    const currentUser = auth.currentUser;
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';

    if (userData.friends && userData.friends.length > 0) {
        for (const friend of userData.friends) {
            // Fetch friend's current data to get their up-to-date profile picture
            const friendDoc = await db.collection('users').doc(friend.userId).get();
            const friendData = friendDoc.data();
            
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            friendItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <img src="${friendData.profilePicture || 'https://www.gravatar.com/avatar/?d=mp'}" 
                        alt="Profile" 
                        style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <span>${friend.username}</span>
                </div>
                <div>
                    <button onclick="removeFriend('${friend.userId}')">Remove</button>
                    <button onclick="openChat('${friend.userId}', '${friend.username}')">Chat</button>
                </div>
            `;
            friendsList.appendChild(friendItem);
        }
    } else {
        friendsList.innerHTML = '<p>No friends yet</p>';
    }
}

async function removeFriend(friendId) {
    const currentUser = auth.currentUser;
    const currentUserRef = db.collection('users').doc(currentUser.uid);
    const friendRef = db.collection('users').doc(friendId);

    try {
        const currentUserDoc = await currentUserRef.get();
        const friendDoc = await friendRef.get();
        const currentUserData = currentUserDoc.data();
        const friendData = friendDoc.data();

        // Remove from current user's friends list
        await currentUserRef.update({
            friends: firebase.firestore.FieldValue.arrayRemove({
                userId: friendId,
                username: friendData.username
            })
        });

        // Remove from friend's friends list
        await friendRef.update({
            friends: firebase.firestore.FieldValue.arrayRemove({
                userId: currentUser.uid,
                username: currentUserData.username
            })
        });

        loadFriends();
        if (currentChatUser === friendId) {
            document.getElementById('chatContainer').style.display = 'none';
        }
    } catch (error) {
        alert('Error removing friend: ' + error.message);
    }
}

function openChat(friendId, friendUsername) {
    currentChatUser = friendId;
    document.getElementById('chatContainer').style.display = 'block';
    document.querySelector('#chatUsername span').textContent = friendUsername;
    loadMessages(friendId);
}

async function loadMessages(friendId) {
    const currentUser = auth.currentUser;
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    // Clear previous listener
    if (messageListener) {
        messageListener();
    }

    // Create a chat ID that's consistent regardless of who started the chat
    const chatId = [currentUser.uid, friendId].sort().join('_');

    // Set up real-time listener for messages
    messageListener = db.collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const message = change.doc.data();
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`;
                    messageDiv.textContent = message.text;
                    chatMessages.appendChild(messageDiv);
                }
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
}

async function sendMessage(event) {
    event.preventDefault();
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || !currentChatUser) return;

    const currentUser = auth.currentUser;
    const chatId = [currentUser.uid, currentChatUser].sort().join('_');

    try {
        await db.collection('chats')
            .doc(chatId)
            .collection('messages')
            .add({
                text: message,
                senderId: currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

        messageInput.value = '';
    } catch (error) {
        alert('Error sending message: ' + error.message);
    }
}

function friendsPanelClose() {
    document.getElementById("container").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function () {

    window.addEventListener("load", () => {
        document.body.style.opacity = "1";
    });


    var rainParticlesCheck = document.getElementById("particlesButtonRain");
var snowParticlesCheck = document.getElementById("particlesButtonSnow");
var stormWeatherCheck = document.getElementById("weatherButtonsStorm");
var blizzardWeatherCheck = document.getElementById("weatherButtonsBlizzard");

const rainGifImage = document.getElementById("rainGifImage");
const rainGif = document.getElementById("rainGif");
const particlesButtonRain = document.getElementById("particlesButtonRain");
const snowGifImage = document.getElementById("snowGifImage");
const snowGif = document.getElementById("snowGif");
const particlesButtonSnow = document.getElementById("particlesButtonSnow");
const blizzardGifImage = document.getElementById("blizzardGifImage");
const blizzardGif = document.getElementById("blizzardGif");
const weatherButtonsBlizzard = document.getElementById("weatherButtonsBlizzard");
const weatherButtonsStorm = document.getElementById("weatherButtonsStorm");


    // ------------- START OF PARTICLES BUTTONS JS ----------------

    function enableRainParticles() {

        if (rainGifImage.style.visibility === "visible") {
            rainGifImage.style.visibility = "hidden";
            rainGif.style.visibility = "hidden";
            particlesButtonRain.textContent = "Enable";

            snowParticlesCheck.disabled = false;
            stormWeatherCheck.disabled = false;
            blizzardWeatherCheck.disabled = false;
        } else {
            rainGifImage.style.visibility = "visible";
            rainGif.style.visibility = "visible";
            particlesButtonRain.textContent = "Disable";

            snowParticlesCheck.disabled = true;
            stormWeatherCheck.disabled = true;
            blizzardWeatherCheck.disabled = true;
        }
    }


    if (particlesButtonRain) {
        particlesButtonRain.addEventListener("click", enableRainParticles);
    }




    function enableSnowParticles () {

        if (snowGifImage.style.visibility === "visible") {
            snowGifImage.style.visibility = "hidden";
            snowGif.style.visibility = "hidden";
            particlesButtonSnow.textContent = "Enable";

            rainParticlesCheck.disabled = false;
            stormWeatherCheck.disabled = false;
            blizzardWeatherCheck.disabled = false;
        } else {
            snowGifImage.style.visibility = "visible";
            snowGif.style.visibility = "visible";
            particlesButtonSnow.textContent = "Disable";

            rainParticlesCheck.disabled = true;
            stormWeatherCheck.disabled = true;
            blizzardWeatherCheck.disabled = true;
        }
    }

    if (particlesButtonSnow) {
        particlesButtonSnow.addEventListener("click", enableSnowParticles);
    }

    // ------------- END OF PARTICLES BUTTONS JS ---------------





    // ------------- START OF WEATHER BUTTONS JS ------------------


    function enableBlizzard() {

        if (blizzardGifImage.style.visibility === "visible") {
            blizzardGifImage.style.visibility = "hidden";
            blizzardGif.style.visibility = "hidden";
            weatherButtonsBlizzard.textContent = "Enable";
            rainParticlesCheck.disabled = false;
            snowParticlesCheck.disabled = false;
            stormWeatherCheck.disabled = false;
        } else {
            blizzardGifImage.style.visibility = "visible";
            blizzardGif.style.visibility = "visible";
            weatherButtonsBlizzard.textContent = "Disable";
            rainParticlesCheck.disabled = true;
            snowParticlesCheck.disabled = true;
            stormWeatherCheck.disabled = true;
        }
    }

    if (weatherButtonsBlizzard) {
        weatherButtonsBlizzard.addEventListener("click", enableBlizzard);
    }



    let stormActive = false;
let lightningInterval;

function enableStorm() {
    if (stormActive) {
        // Stop the storm
        clearInterval(lightningInterval);
        rainGifImage.style.visibility = "hidden";
        rainGif.style.visibility = "hidden";
        lightningGifImage.style.visibility = "hidden";
        lightningGif.style.visibility = "hidden";
        weatherButtonsStorm.textContent = "Enable";

        rainParticlesCheck.disabled = false;
        snowParticlesCheck.disabled = false;
        blizzardWeatherCheck.disabled = false;
        stormActive = false;
    } else {
        // Start the storm
        rainGifImage.style.visibility = "visible";
        rainGif.style.visibility = "visible";
        lightningGifImage.style.visibility = "visible";
        lightningGif.style.visibility = "visible";
        weatherButtonsStorm.textContent = "Disable";

        rainParticlesCheck.disabled = true;
        snowParticlesCheck.disabled = true;
        blizzardWeatherCheck.disabled = true;
        stormActive = true;

        // Make the lightning alternate positions continuously
        lightningInterval = setInterval(() => {
            let randomPosition = Math.random();

            if (randomPosition < 0.75) {
                // 75% chance for left or right
                let isLeftSide = Math.random() < 0.5; // 50% for left, 50% for right
                if (isLeftSide) {
                    lightningGifImage.style.left = "10px";  // Move to left side
                    lightningGifImage.style.transform = "scaleX(1)"; // Normal orientation
                } else {
                    lightningGifImage.style.left = "calc(100% - 100px)";  // Move to right side
                    lightningGifImage.style.transform = "scaleX(-1)"; // Flip horizontally
                }
            } else if (randomPosition < 0.9) {
                // 15% chance for middle-left or middle-right (split equally)
                let isMiddleLeft = Math.random() < 0.5; // 50% for middle-left, 50% for middle-right
                if (isMiddleLeft) {
                    lightningGifImage.style.left = "calc(25% - 50px)";  // Move to middle left
                    lightningGifImage.style.transform = "scaleX(1)"; // Normal orientation
                    lightningGifImage.style.transformOrigin = "center"; // Ensure it's straight
                } else {
                    lightningGifImage.style.left = "calc(75% - 50px)";  // Move to middle right
                    lightningGifImage.style.transform = "scaleX(-1)"; // Flip horizontally
                    lightningGifImage.style.transformOrigin = "center"; // Ensure it's straight
                }
            } else {
                // 5% chance for pure middle
                lightningGifImage.style.left = "calc(50% - 50px)";  // Move to pure middle
                lightningGifImage.style.transform = "scaleX(1)"; // Normal orientation
                lightningGifImage.style.transformOrigin = "center"; // Ensure it's straight
            }

            // Flash effect with 1.75x longer duration (350ms)
            lightningGifImage.style.opacity = "1";  // Show
            setTimeout(() => lightningGifImage.style.opacity = "0", 350); // Hide after 350ms
        }, 750); // Change position every 750ms (3/4 second)
    }
}

// Attach event listener
if (weatherButtonsStorm) {
    weatherButtonsStorm.addEventListener("click", enableStorm);
}

    // ------------ END OF WEATHER BUTTONS JS ------------------


    
    
    
    //----------- CODE FOR BACKGROUND IMAGE CHANGING ------------------
    
    var wallpaperBg1Btn = document.getElementById("wallpaperBg1Btn");
    var wallpaperBg2Btn = document.getElementById("wallpaperBg2Btn");
    var wallpaperBg3Btn = document.getElementById("wallpaperBg3Btn");
    var wallpaperBg4Btn = document.getElementById("wallpaperBg4Btn");




    
    function background1Transition() {

        document.body.style.backgroundImage = "url('https://wallpapers.com/images/featured/lo-fi-mvqzjym6ie17firw.jpg')";

        wallpaperBg1Btn.textContent = "Chosen";
        wallpaperBg1Btn.disabled = true;
        wallpaperBg2Btn.disabled = false;
        wallpaperBg2Btn.textContent = "Choose";
        wallpaperBg3Btn.disabled = false;
        wallpaperBg3Btn.textContent = "Choose";
        wallpaperBg4Btn.disabled = false;
        wallpaperBg4Btn.textContent = "Choose";
    }

    if (wallpaperBg1Btn) {
        wallpaperBg1Btn.addEventListener("click", background1Transition);
    }








    function background2Transition() {

        document.body.style.backgroundImage = "url('https://i.pinimg.com/originals/66/29/ac/6629ac69eee96adbe0880b4f06afdc26.gif')";
    
        wallpaperBg1Btn.disabled = false;
        wallpaperBg1Btn.textContent = "Choose";
        wallpaperBg2Btn.textContent = "Chosen";
        wallpaperBg2Btn.disabled = true;
        wallpaperBg3Btn.disabled = false;
        wallpaperBg3Btn.textContent = "Choose";
        wallpaperBg4Btn.disabled = false;
        wallpaperBg4Btn.textContent = "Choose";
    }

    if (wallpaperBg2Btn) {
        wallpaperBg2Btn.addEventListener("click", background2Transition);
    }





    function background3Transition() {

        document.body.style.backgroundImage = "url('https://s.widget-club.com/images/YyiR86zpwIMIfrCZoSs4ulVD9RF3/293280da671a76a539b89abbce741e3c/309059649f6c758fb2223a2fea97527d.jpg')";
    
        wallpaperBg1Btn.disabled = false;
        wallpaperBg1Btn.textContent = "Choose";
        wallpaperBg2Btn.disabled = false;
        wallpaperBg2Btn.textContent = "Choose";
        wallpaperBg3Btn.textContent = "Chosen";
        wallpaperBg3Btn.disabled = true;
        wallpaperBg4Btn.disabled = false;
        wallpaperBg4Btn.textContent = "Choose";
    }

    if (wallpaperBg3Btn) {
        wallpaperBg3Btn.addEventListener("click", background3Transition);
    }





    function background4Transition() {

        document.body.style.backgroundImage = "url('https://i.postimg.cc/fWGb9PSP/Untitled-design-2.png')";

        wallpaperBg1Btn.disabled = false;
        wallpaperBg1Btn.textContent = "Choose";
        wallpaperBg2Btn.disabled = false;
        wallpaperBg2Btn.textContent = "Choose";
        wallpaperBg3Btn.disabled = false;
        wallpaperBg3Btn.textContent = "Choose";
        wallpaperBg4Btn.textContent = "Chosen";
        wallpaperBg4Btn.disabled = true;
    }

    if (wallpaperBg4Btn) {
        wallpaperBg4Btn.addEventListener("click", background4Transition);
    }

    if (document.getElementById("wallpaperBg1Btn").textContent=="Chosen") {

        wallpaperBg1Btn.disabled = true;

        wallpaperBg2Btn.textContent = "Choose";
        wallpaperBg3Btn.textContent = "Choose";
        wallpaperBg4Btn.textContent = "Choose";
    } else if (document.getElementById("wallpaperBg2Btn").textContent=="Chosen") {

        wallpaperBg2Btn.disabled = true;

        wallpaperBg1Btn.textContent = "Choose";
        wallpaperBg3Btn.textContent = "Choose";
        wallpaperBg4Btn.textContent = "Choose";
    } else if (document.getElementById("wallpaperBg3Btn").textContent=="Chosen") {

        wallpaperBg3Btn.disabled = true;

        wallpaperBg1Btn.textContent = "Choose";
        wallpaperBg2Btn.textContent = "Choose";
        wallpaperBg4Btn.textContent = "Choose";
    } else if (document.getElementById("wallpaperBg4Btn").textContent=="Chosen") {

        wallpaperBg4Btn.disabled = true;

        wallpaperBg1Btn.textContent = "Choose";
        wallpaperBg2Btn.textContent = "Choose";
        wallpaperBg3Btn.textContent = "Choose";
    }

    //------------- END OF WALLPAPER CODE -------------------

    
    
    
    
    // Audio player code

    const songs = [
        { title: "", artist: "", src: ""},
        { title: "CARNIVAL", artist: "Kanye West, Ty Dolla $ign", src: "https://www.dropbox.com/scl/fi/jdm2pc5i0z4tssbtf6t2c/12-Carnival.mp3?rlkey=n9ncc8egcnwes2a9bw5660dky&st=cn0g5e0o&raw=1" },
        { title: "BURN", artist: "Kanye West, Ty Dolla $ign", src: "https://www.dropbox.com/scl/fi/kptzdit2rgx87d1uizdzb/09-Burn.mp3?rlkey=ukc7xnuxbvr1epg27ps2dg5be&st=py6tbav3&raw=1" },
        { title: "Magnolia", artist: "Playboi Carti", src: "https://www.dropbox.com/scl/fi/91dvrw5bzro2p89fddcyf/spotifydown.com-Magnolia-Playboi-Carti.mp3?rlkey=z6zq0vva6dimgy39ywilvtuwf&st=3l1tw5pz&raw=1" },
        { title: "IDGAF", artist: "BoyWithUke, blackbear", src: "https://www.dropbox.com/scl/fi/5c858z7y3ouz8nqem6jxd/spotifydown.com-IDGAF-with-blackbear-BoyWithUke.mp3?rlkey=1fa4hysag7ggge2u6sh5nyawh&st=m0l0ao9o&raw=1" },
        { title: "Save Your Tears", artist: "The Weeknd", src: "https://www.dropbox.com/scl/fi/20acf6hqe3zrbb4ywg9v4/spotifydown.com-Save-Your-Tears-The-Weeknd.mp3?rlkey=klhtvkr7f4wwuzwnui1a2bwzi&st=edx0mba0&raw=1" },
        { title: "Kerosene", artist: "Crystal Castles", src: "https://www.dropbox.com/scl/fi/pssm1vnhnf6yfbkzuz9yf/spotifydown.com-Kerosene-Crystal-Castles.mp3?rlkey=xzbkqsfjxhq8eyrv91nbchiv3&st=05674r11&raw=1"},
        { title: "3D OUTRO", artist: "LUCKI", src: "https://www.dropbox.com/scl/fi/gh1o71q4315gzhof9l45l/spotifydown.com-3D-Outro-LUCKI.mp3?rlkey=bfrc47lgyt4d1y6w7mc1pfw2q&st=fndbxgh7&raw=1"},
        { title: "Diamonds (feat. Gunna)", artist: "Young Thug, Gunna", src: "https://www.dropbox.com/scl/fi/q0sexnbnjgssrwy6xqack/spotifydown.com-Diamonds-feat.-Gunna-Young-Thug.mp3?rlkey=x7v1rwuc3j5tu12xt7u0riwps&st=bdwwpevw&raw=1" },
        { title: "ILoveUIHateU", artist: "Playboi Carti", src: "https://www.dropbox.com/scl/fi/t0cypq0lvqe0xiehfhai4/spotifydown.com-ILoveUIHateU-Playboi-Carti.mp3?rlkey=6utr3gxwy2ggdhb9rxghxtm3e&st=cn00wqkv&raw=1" },
        { title: "New N3on", artist: "Playboi Carti", src: "https://www.dropbox.com/scl/fi/wi1sae8fogv4bgdk5ei8y/spotifydown.com-New-N3on-Playboi-Carti.mp3?rlkey=0qkhbb16iy1iqxep7jzfa32o6&st=ehj7wx21&raw=1" },
        { title: "Our Time", artist: "Lil Tecca", src: "https://www.dropbox.com/scl/fi/adiktphs5yqeweepi3p29/spotifydown.com-Our-Time-Lil-Tecca.mp3?rlkey=h521ror9j3s5asc9ewbcx5diw&st=p9xkgdnj&raw=1" },
        { title: "Gang Baby", artist: "NLE Choppa", src: "https://www.dropbox.com/scl/fi/yqxibbvz1b4a4edv7ojr0/spotifydown.com-Gang-Baby-NLE-Choppa.mp3?rlkey=pd51n0sxphvyi2ets34bnddjt&st=8enciim4&raw=1" },
    ];

    let currentSongIndex = 0;
    let isAutoplayEnabled = true; // Default to autoplay ON
    let isDragging = false;

    const audio = document.getElementById("audio");
    const songTitle = document.getElementById("song-title");
    const songArtist = document.getElementById("song-artist");
    const progress = document.getElementById("progress");
    const progressBar = document.getElementById("progress-bar");
    const progressThumb = document.getElementById("progress-thumb");
    const currentTime = document.getElementById("current-time");
    const totalDuration = document.getElementById("total-duration");
    const playButton = document.getElementById("play-button");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const volumeSlider = document.getElementById("volume-slider");
    const playlistDropdown = document.getElementById("playlist-dropdown");
    const autoplayButton = document.getElementById("autoplay-button");

    function populatePlaylist() {
        playlistDropdown.innerHTML = "";
        songs.forEach((song, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${song.title} - ${song.artist}`;
            playlistDropdown.appendChild(option);
        });
    }

    function loadSong(index) {
        if (index === 0) { // Check if the first item (empty) is selected
            songTitle.textContent = "Nothing is selected";
            songArtist.textContent = "";
            audio.src = ""; // Clear audio source
            audio.pause();
            playButton.textContent = "▶";
            return;
        }
    
        currentSongIndex = index;
        const song = songs[index];
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        audio.src = song.src;
        playlistDropdown.value = currentSongIndex; // Update dropdown selection
        audio.currentTime = 0; // Reset the progress bar
    
        audio.play(); // Play the song immediately
        playButton.textContent = audio.paused ? "▶" : "❚❚";
    }
    

    function playPause() {
        if (audio.paused) {
            audio.play();
            playButton.textContent = "❚❚";
            const song = songs[currentSongIndex];
        } else {
            audio.pause();
            playButton.textContent = "▶";
        }
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
    }

    autoplayButton.addEventListener("click", () => {
        isAutoplayEnabled = !isAutoplayEnabled;
        autoplayButton.textContent = `Autoplay: ${isAutoplayEnabled ? "On" : "Off"}`;
    });

    audio.addEventListener("ended", () => {
        if (isAutoplayEnabled) {
            nextSong();
        }
    });

    playButton.addEventListener("click", playPause);
    nextButton.addEventListener("click", nextSong);
    prevButton.addEventListener("click", prevSong);

    playlistDropdown.addEventListener("change", (e) => {
        loadSong(parseInt(e.target.value)); // Load the selected song
    });

    audio.addEventListener("timeupdate", () => {
        progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        progressThumb.style.left = `${(audio.currentTime / audio.duration) * 100}%`;
        currentTime.textContent = formatTime(audio.currentTime);
        totalDuration.textContent = formatTime(audio.duration);
    });

    volumeSlider.addEventListener("input", () => {
        audio.volume = volumeSlider.value;
    });

    progressBar.addEventListener("click", (e) => {
        const clickX = e.offsetX;
        const width = progressBar.clientWidth;
        audio.currentTime = (clickX / width) * audio.duration;

        playButton.textContent = "❚❚";
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }

    window.onload = () => {
        populatePlaylist();
        loadSong(0); // Load the first song

        songTitle.textContent = "Nothing is playing";
        
    };


    // ------------- END OF AUDIO PLAYER CODE -----------------


    
    // To Do List

    const todoList = document.getElementById('todo-list');
    const saveButton = document.getElementById('save-btn');
    const addButton = document.getElementById('add-btn');
    const removeButton = document.getElementById('remove-btn');
    const selectAllButton = document.getElementById('select-all-btn');
    
    // Function to check if the todo list is empty and disable/enable buttons
    function checkIfEmpty() {
        const todoItems = todoList.querySelectorAll('.todo-item');
        
        // Disable the buttons if there are no items
        if (todoItems.length === 0) {
            removeButton.disabled = true;
            selectAllButton.disabled = true;
            removeButton.classList.add('disabled');
            selectAllButton.classList.add('disabled');
        } else {
            removeButton.disabled = false;
            selectAllButton.disabled = false;
            removeButton.classList.remove('disabled');
            selectAllButton.classList.remove('disabled');
        }
    }
    





    // Function to create a new todo item
    function createTodoItem(title = 'New Task', time = '12:00') {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.draggable = true;
    
        todoItem.innerHTML = `
            <input type="text" value="${title}" />
            <input type="time" value="${time}" />
            <input type="checkbox" class="select-task" />
        `;
    
        todoItem.addEventListener('dragstart', () => {
            todoItem.classList.add('dragging');
        });
    
        todoItem.addEventListener('dragend', () => {
            todoItem.classList.remove('dragging');
        });
    
        return todoItem;
    }




    // Handle drag-and-drop to reorder items
    todoList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(todoList, e.clientY);
        if (afterElement == null) {
            todoList.appendChild(draggingItem);
        } else {
            todoList.insertBefore(draggingItem, afterElement);
        }
    });






    
    // Get the element after the dragged item based on cursor position
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }






    
    // Add a new todo item when the "Add" button is clicked
    addButton.addEventListener('click', () => {
        todoList.appendChild(createTodoItem());
        checkIfEmpty(); // Recheck and disable buttons if necessary
    });





    
    // Remove selected items when the "Remove" button is clicked
    removeButton.addEventListener('click', () => {
        const selectedItems = todoList.querySelectorAll('.select-task:checked');
        
        // Remove the selected items
        selectedItems.forEach(item => {
            todoList.removeChild(item.closest('.todo-item'));
        });
    
        // Reset the "Select All" button to "Select All" if no items are checked
        const checkboxes = todoList.querySelectorAll('.select-task');
        const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        if (!anyChecked) {
            selectAllButton.textContent = "Select All"; // Reset the button text to "Select All"
        }
    
        removeButton.textContent = "Deleted";
        setTimeout(() => {
            removeButton.textContent = "Delete";
        }, 1000);
    
        checkIfEmpty(); // Recheck and disable buttons if necessary
    });





    
    
    // Toggle select all checkboxes when the "Select All" button is clicked
    selectAllButton.addEventListener('click', () => {
        const allChecked = selectAllButton.textContent === "Deselect";
        const checkboxes = todoList.querySelectorAll('.select-task');
    
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
    
        selectAllButton.textContent = allChecked ? "Select All" : "Deselect";
    });
    





    // Save the todo list and set reminders when the "Save" button is clicked
    saveButton.addEventListener('click', () => {
        saveButton.textContent = "Saved";
        setTimeout(() => {
            saveButton.textContent = "Save List";
        }, 1000);
    
        const items = [...todoList.querySelectorAll('.todo-item')].map(item => {
            return {
                element: item,
                title: item.querySelector('input[type="text"]').value,
                time: item.querySelector('input[type="time"]').value
            };
        });
    
        items.forEach(item => {
            const now = new Date();
            const alertTime = new Date();
            const [hours, minutes] = item.time.split(':');
            alertTime.setHours(hours, minutes, 0, 0);
    
            const timeDifference = alertTime.getTime() - now.getTime();
            if (timeDifference > 0) {
                setTimeout(() => {
                    alert(`Reminder: ${item.title} at ${item.time}`);
                    item.element.classList.add('disabled');
                    item.element.querySelector('.select-task').disabled = false;
                }, timeDifference);
            }
        });
    });
    
    // Run the check initially when the page loads to update button states
    checkIfEmpty();

    // ------------- END OF TODOLIST JS ---------------

    
    
    // ----------- START OF GENRE DROPDOWN JS ------------

    const genres = [
        { genre: "Rap" },
        { genre: "Pop" },
    ];
    
    const genreDropdown = document.getElementById("genre-dropdown");
    
    function populateGenreDropdown() {
        genreDropdown.innerHTML = "";
        genres.forEach((genre, index) => { 
            const option = document.createElement("option");
            option.value = index;
            option.textContent = genre.genre;
            genreDropdown.appendChild(option);
        });
    }
    
    populateGenreDropdown();
    
    // ------------ END OF GENRE DROPDOWN JS ---------------




    // --------------------- START OF SIDE-PANEL JS ---------------------

    let openBtn = document.getElementById("hm-icon");
    let sideBar = document.getElementById("mySidebar");
    let closeBtn = document.getElementById("closeBtn");
    let sidePanelOverlay = document.getElementById("sidePanelOverlay");

    openBtn.addEventListener('click', () => {
        sideBar.style.width = "230px";
        sidePanelOverlay.style.display = "block";
    });

    closeBtn.addEventListener('click', () => {
        sideBar.style.width = "0px";
        sidePanelOverlay.style.display = "none";
    });

    sidePanelOverlay.addEventListener('click', () => {
        sideBar.style.width = "0px";
        sidePanelOverlay.style.display = "none";
    });


    let signOutSpBtn = document.getElementById("sign-out-sp-btn");

    signOutSpBtn.addEventListener('click', () => {
        auth.setPersistence(firebase.auth.Auth.Persistence.NONE).then(() => {
            auth.signOut().then(() => {
                // After setting persistence to NONE, sign out and reset the UI
                window.location.href = "index.html";  // Redirect to index.html after sign-out
            }).catch(error => console.error("Sign-out error:", error));
        }).catch(error => console.error("Error clearing persistence:", error));
    });


    let friendsSPBtn = document.getElementById("friends-sp-btn");

    friendsSPBtn.addEventListener("click", () => {
        document.getElementById("container").style.display = "block";
    });


    let profileSpBtn = document.getElementById("profile-sp-btn");
    let profilePanel = document.getElementById("profilePanel");
    let profilePanelOverlay = document.getElementById("profilePanelOverlay");

    profileSpBtn.addEventListener('click', () => {
        sideBar.style.width = "0px";
        sidePanelOverlay.style.display = "none";

        profilePanelOverlay.style.opacity = "1";
        profilePanelOverlay.style.pointerEvents = "auto";
        profilePanelOverlay.style.display = "block";

        setTimeout(() => {
            profilePanel.style.opacity = "1";
            profilePanel.style.pointerEvents = "auto";
        }, 50);

        openBtn.style.pointerEvents = "none";
        openBtn.style.opacity = "0.5";
    });



    function closeProfilePanel() {
        profilePanel.style.opacity = "0";
        profilePanel.style.pointerEvents = "none";

        profilePanelOverlay.style.opacity = "0";
        profilePanelOverlay.style.pointerEvents = "none";

        profileCustomizationPanel.style.opacity = "0";
        profileCustomizationPanel.style.pointerEvents = "none";

        setTimeout(() => {
            profilePanelOverlay.style.display = "none";
        }, 300);

        openBtn.style.pointerEvents = "auto";
        openBtn.style.opacity = "1";
    }

    profilePanelOverlay.addEventListener('click', closeProfilePanel);




    let profileEditBtn = document.getElementById("ppbb-1");
    let profileCustomizationPanel = document.getElementById("profile-customization-panel");

    function openProfileCustomizationPanel() {
        profilePanel.style.opacity = "0";
        profilePanel.style.pointerEvents = "none";

        profilePanelOverlay.style.opacity = "1";
        profilePanelOverlay.style.pointerEvents = "auto";

        profileCustomizationPanel.style.pointerEvents = "auto";

        setTimeout(() => {
            profileCustomizationPanel.style.opacity = "1";
        }, 10);
    }

    profileEditBtn.addEventListener('click', openProfileCustomizationPanel);


    // ---------------- END OF SIDE-PANEL JS ---------------------



    // ---------------- TOOLTIPS START ---------------------


    let mainScreenProfileCustomizationBtn = document.getElementById("profileEdit-icon");

    mainScreenProfileCustomizationBtn.addEventListener('mouseenter', () => {
        let tooltipText = mainScreenProfileCustomizationBtn.getAttribute("data-tooltip");
        let tooltip = document.createElement("div");
        tooltip.className = "profileEditMainPageTooltip";
        tooltip.textContent = tooltipText;

        document.body.appendChild(tooltip);

        // Position tooltip above the profile edit icon
        let rect = mainScreenProfileCustomizationBtn.getBoundingClientRect();
        tooltip.style.left = rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2) + "px";
        tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 5 + "px";

        setTimeout(() => {
            tooltip.classList.add("show");
        }, 10);

        mainScreenProfileCustomizationBtn.tooltipElement = tooltip;
    });

    mainScreenProfileCustomizationBtn.addEventListener('mouseleave', () => {
        if (mainScreenProfileCustomizationBtn.tooltipElement) {
            mainScreenProfileCustomizationBtn.tooltipElement.classList.remove("show");

            setTimeout(() => {
                mainScreenProfileCustomizationBtn.tooltipElement.remove();
            }, 300);
        }
    });

    mainScreenProfileCustomizationBtn.addEventListener('click', () => {
        profilePanelOverlay.style.opacity = "1";
        profilePanelOverlay.style.pointerEvents = "auto";
        profilePanelOverlay.style.display = "block";

        setTimeout(() => {
            profileCustomizationPanel.style.opacity = "1";
            profileCustomizationPanel.style.pointerEvents = "auto";
        }, 50);

        openBtn.style.pointerEvents = "none";
        openBtn.style.opacity = "0.5";
    });

    
    document.getElementById("user-info").addEventListener("click", (event) => {
        if (event.target.tagName === "P") {
            profilePanelOverlay.style.opacity = "1";
            profilePanelOverlay.style.pointerEvents = "auto";
            profilePanelOverlay.style.display = "block";

        setTimeout(() => {
            profilePanel.style.opacity = "1";
            profilePanel.style.pointerEvents = "auto";
        }, 50);
        }
    });


    let mainScreenProfileSettingsBtn = document.getElementById("profileSettings-icon");

    mainScreenProfileSettingsBtn.addEventListener('mouseenter', () => {
        let tooltipText = mainScreenProfileSettingsBtn.getAttribute("data-tooltip");
        let tooltip = document.createElement("div");
        tooltip.className = "profileSettingsMainPageTooltip";
        tooltip.textContent = tooltipText;

        document.body.appendChild(tooltip);

        let rect = mainScreenProfileSettingsBtn.getBoundingClientRect();
        tooltip.style.left = rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2) + "px";
        tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 5 + "px";

        setTimeout(() => {
            tooltip.classList.add("show");
        }, 10);

        mainScreenProfileSettingsBtn.tooltipElement = tooltip;
    });

    mainScreenProfileSettingsBtn.addEventListener('mouseleave', () => {
        if (mainScreenProfileSettingsBtn.tooltipElement) {
            mainScreenProfileSettingsBtn.tooltipElement.classList.remove("show");

            setTimeout(() => {
                mainScreenProfileSettingsBtn.tooltipElement.remove();
            }, 300);
        }
    });



    let hmMenuBtn = document.getElementById("hm-icon");

    hmMenuBtn.addEventListener('mouseenter', () => {
        let tooltipText = hmMenuBtn.getAttribute("data-tooltip");
        let tooltip = document.createElement("div");
        tooltip.className = "hmBtnTooltip";
        tooltip.textContent = tooltipText;
    
        document.body.appendChild(tooltip);
    
        // Position tooltip to the right of the hmMenuBtn
        let rect = hmMenuBtn.getBoundingClientRect();
        tooltip.style.left = rect.right + window.scrollX + 5 + "px"; // 5px gap to the right
        tooltip.style.top = rect.top + window.scrollY + (rect.height / 2) - (tooltip.offsetHeight / 2) + "px"; // Centered vertically
    
        setTimeout(() => {
            tooltip.classList.add("show");
        }, 10);
    
        hmMenuBtn.tooltipElement = tooltip;
    });
    
    hmMenuBtn.addEventListener('mouseleave', () => {
        if (hmMenuBtn.tooltipElement) {
            hmMenuBtn.tooltipElement.classList.remove("show");

            setTimeout(() => {
                hmMenuBtn.tooltipElement.remove();
            }, 300);
        }
    });

    
    // ---------------- TOOLTIPS END ---------------------
        
        

    
    // --------------- START OF CLOCK JS ---------------------

    let hrs = document.getElementById("hrs");
    let min = document.getElementById("min");
    let sec = document.getElementById("sec");
    let ampm = document.getElementById("ampm");

    // Update the clock every second
    setInterval(() => {
        let currentTime = new Date(); // Get the current time
        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        let seconds = currentTime.getSeconds();

        // Determine AM or PM
        let meridian = hours >= 12 ? "PM" : "AM";

        // Convert to 12-hour format
        let displayHours = hours % 12 || 12; // Show 12 for midnight/noon

        // Update the clock elements
        hrs.innerHTML = String(displayHours).padStart(2, '0');
        min.innerHTML = String(minutes).padStart(2, '0');
        sec.innerHTML = String(seconds).padStart(2, '0');
        ampm.innerHTML = meridian;
    }, 1000); // Refresh every second


    // ------------------ END OF CLOCK JS -----------------------

});
