import React, { useState, useEffect } from 'react';
import './/App.css'
import { getDatabase, onValue, ref, set } from "firebase/database";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from 'firebase/compat/app';
// import 'firebase/auth';
import 'firebase/database';
import { getAuth, signOut } from "firebase/auth";


import { signInWithEmailAndPassword} from "firebase/auth";




// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOstOC-EowDQT2rbE7jL_O2S-1lDqd8Ck",
  authDomain: "cs378-p4-864f0.firebaseapp.com",
  databaseURL: "https://cs378-p4-864f0-default-rtdb.firebaseio.com",
  projectId: "cs378-p4-864f0",
  storageBucket: "cs378-p4-864f0.appspot.com",
  messagingSenderId: "175054306006",
  appId: "1:175054306006:web:1c06234f420954d4c4a777",
  measurementId: "G-8NFPYRT79N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// const firebaseAuth = getAuth();

const firebaseAuth = getAuth(app);
function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [resource, setResource] = useState('people');
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setAuthentication] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://swapi.dev/api/${resource}/`);
        const json = await response.json();
        setData(json.results.map(item => item.name));
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, [resource]);

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = resource => {
    setResource(resource);
    setInputValue('');
  };

  const handleSearch = async () => {
    if (!inputValue) return;
    if (isNaN(inputValue)) {
      setError('Error: Please enter a valid integer');
      return;
    }
    try {
      const response = await fetch(`https://swapi.dev/api/${resource}/${inputValue}`);
      const json = await response.json();
      setData([json.name]);
    } catch (error) {
      setError(`Could not find ${resource} with id ${inputValue}`);
    }
  };

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const logOut = event => {
      const auth = getAuth();
      signOut(auth).then(() => {
        setAuthentication(false);
      }).catch((error) => {
      console.log(error)
      });
  }
  const updateValue = event => {
    const database = getDatabase();
    const auth = getAuth();
    const uid = auth.currentUser.uid;
    console.log(event.target.value)
    set(ref(database, "Users/"+uid+"/fav_num"), event.target.value).then(()=>{
      console.log("Updated value");
    }).catch((err) => {
      console.error(err);
    })
  }

  const database = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user !== null ? user.uid : "";
  const [fav_num, setFaveNum] = useState(-1);
  const handleLogin = () => {

    
    signInWithEmailAndPassword(firebaseAuth,username, password) 
    .then((userCredential) => {
      setAuthentication(true);
      return;
    // User signed in
    })
    .catch((error) => {
      console.log(error);
      console.log(username);
      console.log(password);
      return;
    });
    
  }
  useEffect(()=>{
    if(uid !== ""){
      onValue(ref(database, "Users/"+uid+"/fav_num"), (snapshot) => {
        const data = snapshot.val();
        setFaveNum(data);
      });
    }
  });
  return (

    isAuthenticated ?

    <div className="App">
      <h1>Star Wars API</h1>
      <h2>{username}</h2>
      {
        fav_num !== -1 ? <h3>My Star Wars Rating: {fav_num}</h3> : <></>
      }
      
      <button onClick={logOut}>Log Out</button>
      <form>
        <label for="new-value">New Value:</label>
        <input type="text" id="new-value" name="new-value" onChange={updateValue}/>
        {/* <button type="button" onclick="updateValue()">Update Value</button> */}
      </form>
      
      <div>
        
        <button onClick={() => handleButtonClick('people')}>People</button>
        <button onClick={() => handleButtonClick('planets')}>Planets</button>
        <button onClick={() => handleButtonClick('starships')}>Starships</button>
        {resource === 'people' && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter a number"
          />
        )}
        <button onClick={handleSearch}>Search</button>
      </div>
      {error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>

    :
    <div>

    Login:
    <input
            type="text"
            value = {username}
            onChange={(e) => {setUsername(e.target.value)}}

            placeholder="Enter Email"
    />
    <input
            type="text"
            value = {password}
            onChange={(e) => {setPassword(e.target.value)}}
            placeholder="Enter Password"
    />
    <button onClick={() => {handleLogin()}}>Submit</button>

        
    </div>
  );
}

export default App;
