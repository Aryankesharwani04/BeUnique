import React, { useEffect, useState } from 'react';
import './Container.css';
import verifyVideo from './assets/verify.mp4'

function Container() {
    const [linkedin, setLinkedin] = useState(false);
    const [github, setGithub] = useState(false);
    const [leetcode, setLeetcode] = useState(false);
    const [verify, setVerify] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [mode, setMode] = useState(false);

    async function checkUsername(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;

        try {
            const response = await fetch("http://localhost:8000/checkUsername", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();
            setLinkedin(data.linkedin);
            setGithub(data.github);
            setLeetcode(data.leetcode);
            setVerify(true);
        } catch (error) {
            console.error("Error checking username:", error);
        }
    }

    function changeMode(){
        const d = document.querySelector('body');
        if(!mode){
            d.style.backgroundColor = "#ffffff";
            d.style.color = "#000000";
        }else{
            d.style.backgroundColor = "";
            d.style.color = "";
        }
        setMode(!mode);
    }

    useEffect(() => {
        setVerify(false);
    }, [inputValue]);
               
    return (
        <div className='w-screen h-screen flex justify-between items-center p-6 rounded-lg shadow-lg'>
            <div className='w-2/5 p-6'>
                <h1 className='text-4xl font-bold text-600 mb-4'>Be Unique</h1>
                <p className='text-700 mb-2'>
                    <span>Ti</span><span>r</span>ed of selecting new unique or common username at everyplace. We are here to help you select an username easily for all official platforms.
                     These username will help you identify yourself uniquely from everyone.
                </p>
                <p className='text-700 font-bold text-2xl mb-4'>Let's choose your new unique official username.</p>
            </div>
            <div className='w-3/5 p-4 flex-col justify-center items-center'>
                <div className="flex justify-end relative bottom-18">
                    {mode ? 
                        <i className="ri-moon-line text-black text-2xl bg-gray-200 rounded-full p-3 cursor-pointer" title='Dark Mode' onClick={changeMode}></i>
                        : 
                        <i className="ri-moon-fill text-white text-2xl bg-gray-700 rounded-full p-3 cursor-pointer" title='Light Mode' onClick={changeMode}></i>
                        }
                    </div>   
                <form className='w-auto'>
                    <h1 className='text-2xl font-bold mb-2 text-700'>tyPe YouR iDeal uSeRnAme</h1>
                    <div className='flex flex-col justify-center items-center'>
                        <input 
                            type="text" 
                            name="username" 
                            id="username" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className='outline-none w-96 border border-violet-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <input 
                            type="submit" 
                            value="Check" 
                            onClick={checkUsername} 
                            className='bg-indigo-600 text-white font-semibold py-2 px-4 rounded-tr-md rounded-bl-md hover:bg-blue-700 transition duration-300 mt-4'
                        />
                    </div>
                </form>
                <div className='flex-col text-center justify-center items-center'>
                    <h3 className='mb-4 text-lg font-medium mt-4 text-200'>Can be used in</h3>
                    {verify ? 
                        <div className='flex-col justify-center items-center font-bold text-center pl-5 text-700'>
                            <p className='pl-76 mb-2 flex gap-2'>LinkedIn { linkedin ? <img width="24" height="24" src="https://img.icons8.com/color/48/verified-account--v1.png" alt="verified"/> : <img width="24" height="24" src="https://img.icons8.com/ios/50/verified-account.png" alt="n/a"/> } </p>
                            <p className='pl-76 mb-2 flex gap-2'>Github { github ? <img width="24" height="24" src="https://img.icons8.com/color/48/verified-account--v1.png" alt="verified"/> : <img width="24" height="24" src="https://img.icons8.com/ios/50/verified-account.png" alt="n/a"/> } </p>
                            <p className='pl-76 mb-2 flex gap-2'>LeetCode { leetcode ? <img width="24" height="24" src="https://img.icons8.com/color/48/verified-account--v1.png" alt="verified"/> : <img width="24" height="24" src="https://img.icons8.com/ios/50/verified-account.png" alt="n/a"/> } </p>
                        </div>
                    :   
                        <div className='flex-col justify-center items-center font-bold text-center pl-5 text-700'>
                            <p>Click CHECK to Verify.....</p>
                            <div className='flex justify-center'>
                                <video src={verifyVideo} autoPlay muted loop alt="verify video"className='h-24 w-24 rounded-full'>
                                    Your browser does not support the video tag. Please update your browser.
                                </video>
                            </div>
                            
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Container;
