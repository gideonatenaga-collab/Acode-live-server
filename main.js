"use strict";
(() => {
    let editorManager = window.editorManager;
    // let TotalUnsavedFiles = editorManager.hasUnsavedFiles();
    let settings = acode.require('settings');
    let SideButton = acode.require('sideButton');
    var jsonData = {}; //lets initiolize it empty well ad the things further
    const editorFile = acode.require('editorFile');
    acode.addIcon('full-screen', 'https://ibb.co/knfL8D9');

    let oldSetting = settings.get('autosave') /// needs menimum valur 1000 mili seconds
    var e = {
        "id": "liveserver",
        "name": "Live Server",
        "main": "main.js",
        "version": "2.0.2",
        "readme": "readme.md",
        "icon": "icon.png",
        "files": [],
        "minVersionCode": 290,
        "license": "",
        "changelogs": "changelogs.md",
        "keywords": ["Live Server", "live", "HTML Viewer"],
        "price": 0,
        "repository": "https://github.com/hackesofice/Acode-live-server.git",
        "author": {
            "name": "HACKESOFICE",
            "email": "hackesofice@gmail.com",
            "github": "hackesofice"
        }
    }

    class LiveServer {
        //// ill improve the destroyesr further
        constructor() {
            this.port = null;
            this.isBigScreenEnabled = false;
            this.isServerOnline = false;

        }

        async init() {
            console.log("LiveServerPlugin initialized!");
            // settings.update({
            //     "Live-Server":{
            //         "status": true,
            //         "mode": "short"
            //     }
            // })
            this.reloadFile = () => {
                try {
                    let iframe = document.getElementById('iframe');
                    if (iframe) {
                        iframe.src = `http://localhost:${jsonData.port}/${jsonData.fileName}`;
                    }
                } catch (err) {
                    console.log(`Live server error ${err}`);
                }
            }
            let BigScreenContent = document.createElement('div');
            BigScreenContent.style.cssText = `
            height:100%;
            border: 2px solid black;
            border-radius: 5px;
            `;
            var iframe22 = document.createElement('iframe');
            iframe22.className = 'iframe22';
            iframe22.style.cssText = `
               height:90%;
               width: 90%;
               margin:5% 5% 5% 5%;
               border-radius:5px;
            `;
            BigScreenContent.appendChild(iframe22);
            this.BigScreenContent = BigScreenContent;

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
            var iframe2 = document.createElement('iframe');
            iframe2.className = "iframe";
            iframe2.id = "iframe2";
            iframe2.style.cssText = `
                        top:0px;
                        right:0px;
                        left:0px;
                        bottom:0px
                        border:5px solid green;
                    `;

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
                let iframe = document.createElement('iframe');
                iframe.id = 'iframe';
                iframe.className = 'iframe';
                iframe.style.cssText = `
                    right:0;
                    left:0;
                    bottom:0;
                    border: 1px solid black;
                    height: 100%;
                    width: 100%;
                    box-shadow: 0px 0px 10px rgba(0.0.0.0.50);
                    `;
                //)//////////////////////////////////////////////////////
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

                let maxFullScreen = document.createElement('button');
                maxFullScreen.className = 'icon googlechrome';
                maxFullScreen.id = 'maxFullScreen';
                maxFullScreen.onclick = addBigScreenPage;
                maxFullScreen.style = `
                           margin-right: 10px;
                        `

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
                    let touch = event.touches ? event.touches[0] : event;
                    startY = touch.clientY;
                    startHeight = windowDiv.offsetHeight;
                    document.body.style.userSelect = "none";
                }

                function performResize(event) {
                    if (!isResizing) return;
                    let touch = event.touches ? event.touches[0] : event;
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
                titleBar.appendChild(maxFullScreen);// now we will add it if the server is connected
                windowDiv.appendChild(titleBar);
                windowDiv.appendChild(hrTag);
                // windowDiv.appendChild(iframe);
                main_screen.appendChild(iframe);
                windowDiv.appendChild(main_screen);
                // document.querySelector('.editor-container').appendChild(windowDiv);
                /// for now lets add it directly on body editor-container
                document.body.appendChild(windowDiv);
                //document.body.appendChild(maximizeButton);
                //console.log("Live Server Window added!");
                handleTheBackend();
            }// endimg of open window function




            ///// now start the backend such as defining the differebt typws of variables like getting the file name etc and before UI loading prepare for it like connection with the server etc
            /////// copied this logic from acodex terminal (,by bajrang coarder)
            function resolvePath(rawPath) {
               // alert(baseUrl);
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
                //let ActiveFileType = null;
                ActiveFile = editorManager.activeFile; //returns the object
                //ActiveFileType = editorManager.activeFile.session.$modeId; //returns the file type like its a javaacript or html or something
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


            function isHTMLFile() {
                // console.log(editorManager);
                if (
                    editorManager &&
                    editorManager.activeFile &&
                    editorManager.activeFile.session &&
                    editorManager.activeFile.session.$modeId
                ) {
                    // console.log('inside if html file function and session is tfuthy')
                    const ActiveFileType = editorManager.activeFile.session.$modeId;
                    if (ActiveFileType) {
                        return ActiveFileType === 'ace/mode/html';
                    }
                } else {
                    //   console.log('inside if html file function and session is falsy')
                    return false;
                }
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
                        console.log('unable to connect server');
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
                    }, 1000);
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
                //console.log(navigator.onLine)
                const iframes = document.querySelectorAll('iframe.iframe');
                //    console.log(iframes)
                if (iframes.length > 0) {
                    let i = -1;
                    while (i < iframes.length) {
                        const default_content = `
                                        <body> 
                                            <h1> server status = off </h1>
                                            <h1> Phone Network status = off </h1>
    
                                        </body> 
                                `;
                        // console.log(iframes)
                        try { 
                             // returns true/false based on data connection
                            if (navigator.onLine) {
                                let iframe = document.getElementById('iframe');
                                if (iframe) {
                                    iframe.src = 'https://acode-live-server-documentations.vercel.app/';
                                }
                                if (iframe22) {
                                    iframe22.src = 'https://acode-live-server-documentations.vercel.app/';
                                } else {
                                    console.warn("can not able to find the iframe22");
                                }
                            } else {
                                let iframe = document.getElementById('iframe');
                                if (iframe) {
                                    iframe.contentWindow.document.body.innerHTML = default_content;
                                    setTimeout(() => {
                                        const btn = document.getElementById('closeButton')
                                        const miniRedLiveButton = document.getElementById('maximizeButton')

                                        //Remove the red live button before removing thr resizable window
                                        if (miniRedLiveButton) {
                                            miniRedLiveButton.style.display = 'none'
                                        }
                                        if (btn) {
                                            btn.click()
                                        }

                                    }, 10000);
                                }
                                if (iframe22) {
                                    iframe22.contentWindow.document.body.innerHTML = default_content;
                                }else {
                                  console.log("iframe22 doesnt exists");
                                }

                            }

                        } catch (error) {
                            console.error(`erro gotten ${error}`)
                        }
                        i++;
                    }
                } else {
                    console.error('cant find any iframe');
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
            


            ////////////////////))/))////ll/)//////////////
            // COADING FOR BIG SCREEN
            function addBigScreenPage() {
                
                if (!this.reloadBigScreen){
                    this.reloadBigScreen = (() => {
                        const iframe3 = BigScreenContent.querySelector("iframe.iframe22");
                        if (this.isServerOnline){
                            iframe3.src = `http://localhost:${jsonData.port}`;
                        }else {
                            iframe3.contentWindow.document.body.innerHTML = `
                                    hello brother server is off
                                `;
                        }
                    });
                }
                
                if (!this.isBigScreenEnabled){
                    const bigScreen = new editorFile('Live Server', {
                        type: 'page',
                        render: true,
                        content: BigScreenContent,
                        tabIcon: "icon googlechrome",
                    });
                    this.isBigScreenEnabled = true;
                    editorManager.on("save-file", this.reloadBigScreen);
                    
                    bigScreen.on('close', () => {
                        this.isBigScreenEnabled = false;
                        editorManager.off("save-file", this.reloadBigScreen);
                    });
                }
              
                
                
            }

        }// cloasing of init functio9n

        async destroy() {
            console.log('destroyed');
            console.log(this);
            document.getElementById('live-server-window')?.remove();
            if (this.liveServerButton) {
                this.liveServerButton.hide();
                this.liveServerButton = undefined;
            }
            if (this.reloadFile) {
                editorManager.off('save-file', this.reloadFile);
            } else {
                console.warn('this.reloadFileisnt defined');
            }
            if (this.showOrHideIFhtml) {
                editorManager.off('switch-file', this.showOrHideIFhtml);
            } else {
                console.warn('this.showOrHideIFhtml not defined')
            }
            document.getElementById('maximizeButton')?.remove();
            if (settings) {
                settings.update({
                    autosave: oldSetting
                });
            }
            if (this.reloadBigScreen) {
              editorManager.off("save-file", this.reloadBigScreen);
            }
            if (this.bigScreen){
              this.bigScreen.remove(true);
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
