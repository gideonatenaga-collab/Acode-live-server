"use strict";
(() => {
    let editorManager = window.editorManager;
    // let TotalUnsavedFiles = editorManager.hasUnsavedFiles();
    let settings = acode.require('settings');
    let SideButton = acode.require('sideButton');
    var jsonData = {}; //lets initiolize it empty well ad the things further

    let oldSetting = settings.get('autosave') /// needs menimum valur 1000 mili seconds
    var e = {
        "id": "liveserver",
        "name": "Live Server",
        "main": "main.js",
        "version": "1.1.3",
        "readme": "readme.md",
        "icon": "icon.png",
        "files": [],
        "minVersionCode": 290,
        "license": "",
        "changelogs": "changelogs.md",
         "repository":"https://github.com/hackesofice/Acode-live-server.git",
        "keywords": ["Live Server", "live", "HTML Viewer"],
        "price": 0,
        "author": {
            "name": "HACKESOFICE",
            "email": "hackesofice@gmail.com",
            "github": "hackesofice"
        }
    }
    class LiveServer {
        //// ill improve the destroyesr further
        constructor () {
            this.port = null;
            this.reloadFile = () => {
                let iframe = document.getElementById('iframe');
                if (iframe) {
                    iframe.src = `http://localhost:${jsonData.port}/${jsonData.fileName}`;
                }
            }
        }

        async init() {
            console.log("LiveServerPlugin initialized!");
            this.openWindow = () => {
                //   console.log('clicked');
                if (!document.getElementById("live-server-window")) {
                    showWindow();
                }
            }
            this.liveServerButton = SideButton(
                {
                    text: 'Live Server',
                    icon: 'warningreport_problem',
                    onclick: this.openWindow,
                    backgroundColor: 'red',
                    textColor: '#000',
                }
            );
            this.showOrHideIFhtml = () => {
                if (isHTMLFile()) {
                    if (this.liveServerButton) {
                        this.liveServerButton.show();
                    }
                } else if (this.liveServerButton) {
                    this.liveServerButton.hide();
                }

            }
            this.showOrHideIFhtml();
            
            
            
            ///////////////////////////////////////////////////////////////////
            ///INITILIZING ALL EVENT Listeners///////
            editorManager.on('save-file', () => {
                ///i have to move it to an seprate function so that it will only listen when its actually needed its efficient use of resources
                ///ill update it later its forcing the windo to relode
                this.reloadFile();
            });

            editorManager.on('switch-file', () => {
                this.showOrHideIFhtml();
            });


            //////////////////////////////////////////////////////////
            ///coading for UI or frontend
            function showWindow() {
                settings.update({
                    autosave: 1000
                });
                if (!document.body) {
                    console.error("document.body is not available!");
                    return;
                }

                ////// button for hiding and showing
                document.getElementById("live-server-window")?.remove();
                let windowDiv = document.createElement('div');
                windowDiv.id = "live-server-window";
                windowDiv.style.cssText = `
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right:0; !important;
                    width: 100% !important;
                    max-width:100% !important;
                    height: 40vh !important;
                    background: white !important;
                    border-top: 2px solid black !important;
                    box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.5) !important;
                    z-index: 90 !important;
                    overflow: hidden !important;
                    transition: height 0.1s ease !important;
                    `;

                // Create Title Bar
                let titleBar = document.createElement('div');
                titleBar.style.cssText = `
                    width: 100%;
                    height: 40px;
                    background: #222;
                    color: white;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px;
                    cursor: ns-resize;
                    user-select: none;
                    touch-action: none;
                    `;
                titleBar.innerText = "Live Server Window";

                // Close Button
                let closeButton = document.createElement('button');
                closeButton.id = 'closeButton';
                closeButton.innerText = "×";
                closeButton.onclick = shutDownLiveServer;
                closeButton.style.cssText = `
                    right:20px;
                    background: red;
                    color: white;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    `;
                ///,minimze button
                let minimizeButton = document.createElement('button');
                minimizeButton.innerText = '➖';
                minimizeButton.onclick = hideTheWindow;
                minimizeButton.style.cssText = `
                    margin-right:0;
                   `;

                // Horizomtal rule
                let hrTag = document.createElement('hr');
                hrTag.style.cssText = `
                    border: 1px solid black;
                    margin-top: 2px;
                    `;

                ///div for holding the iframe
                let main_screen = document.createElement('div');
                main_screen.style.cssText = `
                    bottom: 0;
                    top: 10px;
                    border: 1px solid black;
                    height: 100%;
                    width: 100%;
                    `;

                //iframe for rendering
                let iframe = document.createElement('iframe');
                iframe.id = 'iframe';
                iframe.className = 'iframe';
                //    iframe.src = '';
                iframe.style.cssText = `
                    right:0;
                    left:0;
                    bottom:0;
                    border: 1px solid black;
                    height: 100%;
                    width: 100%;
                    box-shadow: 0px 0px 10px rgba(0.0.0.0.50);
    
                    `;

                ///close the serve(clint)
                function shutDownLiveServer() {
                    //  console.log("Closing live server window...");
                    windowDiv.remove();
                    editorManager.off('save-file', this.reloadFile);
                    titleBar.removeEventListener("mousedown", startResize);
                    titleBar.removeEventListener("touchstart", startResize);
                    window.removeEventListener("mousemove", performResize);
                    window.removeEventListener("touchmove", performResize);
                    window.removeEventListener("mouseup", stopResize);
                    window.removeEventListener("touchend", stopResize);
                    settings.update({
                        autosave: oldSetting
                    });

                };

                // Resizing Logic for Touch & Mouse
                let isResizing = false;
                let startY,
                startHeight;

                function startResize(event) {
                    // console.log("Resizing started!");
                    isResizing = true;
                    let touch = event.touches ? event.touches[0]: event;
                    startY = touch.clientY;
                    startHeight = windowDiv.offsetHeight;
                    document.body.style.userSelect = "none";
                }

                function performResize(event) {
                    if (!isResizing) return;
                    let touch = event.touches ? event.touches[0]: event;
                    let newHeight = startHeight + (startY - touch.clientY);
                    // console.log("New Height:", newHeight);
                    if (newHeight >= 100 && newHeight <= window.innerHeight * 0.9) {
                        windowDiv.style.height = `${newHeight}px`;
                    }
                }

                function stopResize() {
                    /// console.log("Resizing stopped!");
                    isResizing = false;
                    document.body.style.userSelect = "auto";
                }

                // Attach Both Mouse & Touch Listeners
                titleBar.addEventListener("mousedown", startResize);
                titleBar.addEventListener("touchstart", startResize);
                window.addEventListener("mousemove", performResize);
                window.addEventListener("touchmove", performResize);
                window.addEventListener("mouseup", stopResize);
                window.addEventListener("touchend", stopResize);

                // Append im ui
                titleBar.appendChild(minimizeButton);
                titleBar.appendChild(closeButton);
                windowDiv.appendChild(titleBar);
                windowDiv.appendChild(hrTag);
                //    windowDiv.appendChild(iframe);
                main_screen.appendChild(iframe);
                windowDiv.appendChild(main_screen);
                // document.querySelector('.editor-container').appendChild(windowDiv);
                /// for now lets add it directly on body editor-container
                document.body.appendChild(windowDiv);
                // document.body.appendChild(maximizeButton);
                //console.log("Live Server Window added!");

                handleTheBackend();
            }// endimg of open window function




            ///// now start the backend such as defining the differebt typws of variables like getting the file name etc and before UI loading prepare for it like connection with the server etc
            /////// copied this logic from acodex terminal (,by bajrang coarder)
            function resolvePath(rawPath) {
                if (rawPath.startsWith("content://com.termux.documents/tree")) {
                    const path = rawPath.split("::")[1];
                    const trimmed = path.substring(0, path.lastIndexOf("/"));
                    return trimmed.replace(/^\/data\/data\/com\.termux\/files\/home/, "$HOME");
                }
                if (rawPath.startsWith("file:///storage/emulated/0/")) {
                    const trimmed = rawPath.substr(26).replace(/\.[^/.]+$/, "");
                    const directory = trimmed.split("/").slice(0, -1).join("/");
                    return `/sdcard${directory}/`;
                }
                if (rawPath.startsWith("content://com.android.externalstorage.documents/tree/primary")) {
                    const trimmed = rawPath.split("::primary:")[1];
                    const directory = trimmed.substring(0, trimmed.lastIndexOf("/"));
                    return `/sdcard/${directory}`;
                }
                return false;
            }


            ////////It returns tye json data object which contains
            //////// 1 file url and file name
            function handleTheBackend() {
                let rawPath = null;
                let savedFilePath = null;
                let cacheFilePath = null;
                let ActiveFile = null;
                let ActiveFileType = null;
                ActiveFile = editorManager.activeFile; //returns the object
                ActiveFileType = editorManager.activeFile.session.$modeId; //returns the file type like its a javaacript or html or something
                savedFilePath = ActiveFile.uri; //the ActiveFile is instance of inbuilt editorManager API
                cacheFilePath = ActiveFile.cacheFile;

                //console.log(ActiveFile);

                if (!savedFilePath && !cacheFilePath) {
                    return;
                } else {
                    rawPath = savedFilePath || cacheFilePath; //it will assign a value whis is avilable
                    if (savedFilePath) {
                        const rawFilePath = rawPath;
                        const fileName = rawFilePath.split('/').pop();

                        const originalPath = resolvePath(rawPath);
                        if (!originalPath) {
                            return;
                        } else {
                            jsonData.path = originalPath;
                            jsonData.fileName = fileName;
                            if (!jsonData.port) {
                                (async () => {
                                    let livePort = await getLivePortIfAvilable();
                                    if (livePort) {
                                        console.log(`live port gotten its ${livePort}`)
                                        jsonData.port = livePort;
                                        console.log(jsonData)
                                        checkServer(jsonData);
                                    } else {
                                        console.log('port not found showing default window')
                                        showDefaultWindow();
                                    }
                                })();
                            } else {
                                checkServer(jsonData);
                            }
                        }

                    } else if (cacheFilePath) {
                        alert('the file you wanna run its unsaved file please save it')
                        const btn = document.getElementById('closeButton');
                        btn?.click();
                        return;
                    }
                }

            }


            function hideTheWindow() {
                //////////Hide the window
                document.getElementById('live-server-window').style.display = 'none';
                //    current_display.style.display = current_display.style.display = 'none' ? 'none' : 'block';
                let btn = document.getElementById('maximizeButton');
                if (!btn) {
                    let maximizeButton = document.createElement('button');
                    maximizeButton.id = 'maximizeButton';
                    maximizeButton.onclick = showTheWindow;
                    maximizeButton.innerText = 'LIVE';
                    maximizeButton.style.cssText = `
                                height: 35px !important;
                                width: 35px !important;
                                border: 2px solid black !important;
                                border-radius: 5px !important;
                                position: absolute !important;
                                left: 10px !important;
                                bottom: 50% !important;
                                z-index: 10000 !important;
                                color: black;
                                background-color: red !important; /* Changed for visibility */
                            `;
                    /////append tge created button

                    document.body.appendChild(maximizeButton);
                } else {
                    ////// show the button if alredy exists
                    btn.style.display = 'block';
                }
            }


            ///because of thisfunction called by thr maximize button to thers no chance to be undefined
            function showTheWindow() {
                document.getElementById('live-server-window').style.display = 'block';
                document.getElementById('maximizeButton').style.display = 'none';
            }

            //////////// SOME RAW FUNCTIONS

            function isHTMLFile() {
                let ActiveFileType = editorManager.activeFile.session.$modeId;
                return ActiveFileType === 'ace/mode/html';
            }

            async function checkServer(jsonData) {
                let jsonDataDuplicate = jsonData;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds
                //   console.log('check server function triggerd')
                try {
                    const response = await fetch(`http://localhost:${jsonData.port}/setup`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(jsonData),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    if (!response || !response.ok) {
                        console.log('unable to connect server')
                        //throw new Error(`Server error: ${response.status}`);
                        return;
                    }
                    //     const data = await response.json();
                    //     console.log(data);
                    setTimeout(() => {
                        let iframe = document.getElementById('iframe');
                        if (iframe) {
                            iframe.src = `http://localhost:${jsonData.port}/`;
                        }
                    },1000);
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.error('Fetch request timed out');
                    } else {
                        console.error('Live server not reachable:', error.message);
                    }
                    showDefaultWindow()
                }
            }

            function showDefaultWindow() {
                const iframe = document.querySelector('#iframe');
                if (iframe) {
                    const default_content = `
                    <style>
                    * {
                       box-sizing: border-box;
                       font-family: 'Courier New', monospace;
                     }

                    body {
                         margin: 0;
                         height: 100vh;
                         background: radial-gradient(ellipse at center, #0f0f0f 0%, #000000 100%);
                         color: #00ffcc;
                         display: flex;
                         justify-content: center;
                         align-items: center;
                         overflow: hidden;
                      }

                    .terminal {
                        text-align: center;
                        padding: 30px;
                     }

                    h1 {
                       font-size: 32px;
                       text-shadow: 0 0 5px #00ffcc, 0 0 10px #00ffcc;
                       animation: glitch 1s infinite;
                    }

                    p {
                        margin-top: 15px;
                        font-size: 18px;
                        opacity: 0.8;
                     }

                    .retry-btn {
                        margin-top: 30px;
                        padding: 14px 30px;
                        font-size: 16px;
                        color: #000;
                        background: #00ffcc;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        box-shadow: 0 0 10px #00ffcc, 0 0 20px #00ffcc;
                        transition: 0.3s ease;
                    }

                    .retry-btn:hover {
                        background: #00e6b8;
                        box-shadow: 0 0 15px #00e6b8, 0 0 30px #00e6b8;
                    }

                    @keyframes glitch {
                       0% {
                          transform: translate(0);
                        }
                        20% {
                          transform: translate(-1px, 1px);
                       }
                      40% {
                       transform: translate(-1px, -1px);
                        }
                      60% {
                           transform: translate(1px, 1px);
                       }
                       80% {
                            transform: translate(1px, -1px);
                       }
                       100% {
                           transform: translate(0);
                        }
                    }

                    .matrix-lines {
                       position: absolute;
                       width: 100%;
                       height: 100%;
                       overflow: hidden;
                       top: 0;
                       left: 0;
                       pointer-events: none;
                    }

                    .matrix-lines::before {
                       content: '';
                       position: absolute;
                       top: -100%;
                       left: 50%;
                       width: 2px;
                       height: 200%;
                       background: linear-gradient(to bottom, transparent, #00ffcc, transparent);
                       animation: scrollDown 3s linear infinite;
                       opacity: 0.3;
                    }

                    @keyframes scrollDown {
                       0% {
                          top: -100%;
                        }
                       100% {
                          top: 100%;
                       }
                    }
                    </style>
                    <body>
                        <div class="matrix-lines"></div>
                        <div class="terminal">
                        <h1>!! SERVER OFFLINE !!</h1>
                        <p>Please open the termux and run server, for now its only way to use it but we are working to improve it</p>
                        <button class="retry-btn" onclick="retry()">RETRY</button>
                    </div>

                    <script>
                        function retry() {
                           location.reload();
                        }
                    </script>
                    </body>
                    `;

                    iframe.contentWindow.document.body.innerHTML = default_content;
                    setTimeout(() => {
                        const btn = document.getElementById('closeButton')
                        const miniRedLiveButton = document.getElementById('maximizeButton')
                        
                        //Remove the red live button before removing thr resizable window
                        if (miniRedLiveButton){
                            miniRedLiveButton.style.display = 'none'
                        }
                        if (btn) {
                            btn.click()
                        }
                        
                    },10000);
                }

            }

            async function getLivePortIfAvilable(timeout = 1000) {
                let portList = [1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034];
                for (let port of portList) {
                    const controller = new AbortController();
                    const signal = controller.signal;

                    // Set a timeout to abort the fetch
                    const timer = setTimeout(() => {
                        controller.abort();
                    }, timeout);

                    try {
                        const response = await fetch(`http://localhost:${port}/check`, {
                            method: 'GET',
                            signal: signal
                        });
                        clearTimeout(timer);

                        if (response.ok) {
                            return port;
                        }
                    } catch (err) {
                        clearTimeout(timer);
                //        console.log(`Port ${port} failed or timed out:`, err.message);
                     //   console.clear()
                    }
                }
                return null;
            }

        }// cloasing of init function

        async destroy() {
            console.log('destroyed');
            document.getElementById('live-server-window')?.remove();
            if (this.liveServerButton) {
                this.liveServerButton.hide();
                this.liveServerButton = undefined;
            }
            if (this.reloadFile) {
                editorManager.off('save-file', this.reloadFile);
            } else {
                console.log('this.reloadFileisnt defined');
            }
            if (this.showOrHideIFhtml) {
                editorManager.off('switch-file', this.showOrHideIFhtml);
            } else {
                console.log('this.showOrHideIFhtml not defined')
            }
            document.getElementById('maximizeButton')?.remove();
            if (settings) {
                settings.update({
                    autosave: oldSetting
                });
            }
        }
    }//and her is the AcodePlugin class ends
    
    
    if (window.acode) {
        // console.log('inside acode window');
        let i = new LiveServer();
        //  console.log('cr3ated i instance');
        acode.setPluginInit(e.id, async (n, o, {
            cacheFileUrl: s, cacheFile: d
        }) => {
            n.endsWith("/") || (n += "/");
            i.baseUrl = n;
            //  console.log('runnig the init Function');
            await i.init(o, d, s);
        });
        acode.setPluginUnmount(e.id, () => {
            i.destroy();
        });
    }
})();
