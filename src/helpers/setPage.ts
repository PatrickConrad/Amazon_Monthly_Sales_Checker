import puppeteer  from "puppeteer-extra";
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import {Browser, ElementHandle, Page, executablePath} from 'puppeteer';
import { wait } from "./wait";

export const setPage = async (browser: Browser) => {
    const startPage = await browser.newPage(); 
    await startPage.setDefaultNavigationTimeout(0); 

    //doesn't make image requests
    await startPage.setRequestInterception(true); 
    startPage.on('request', async (request) => { 
        if (request.resourceType() == 'image') { 
            await request.abort(); 
        } else { 
            await request.continue(); 
        } 
    }); 


    //Set headers
    await startPage.setExtraHTTPHeaders({ 
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', 
        'upgrade-insecure-requests': '1', 
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
        'accept-encoding': 'gzip, deflate, br, utf8',
        'accept-language': 'en-US,en;q=0.9,en;q=0.8' 
    }); 


    // Setting page view width: 1366, height: 768}
    await startPage.setViewport({ width: 1480, height: 1200 }); 

    return startPage
}

export const setNonStealthPage = async (browser: Browser) => {
    const startPage = await browser.newPage(); 
    await startPage.setDefaultNavigationTimeout(0); 

    //doesn't make image requests
    await startPage.setRequestInterception(true); 
    startPage.on('request', async (request) => { 
        await request.continue();
    }); 


    //Set headers
    await startPage.setExtraHTTPHeaders({ 
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', 
        'upgrade-insecure-requests': '1', 
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
        'accept-encoding': 'gzip, deflate, br, utf8',
        'accept-language': 'en-US,en;q=0.9,en;q=0.8' 
    }); 


    // Setting page view 
    await startPage.setViewport({ width: 1280, height: 720 }); 

    return startPage
}


export const normalBrowser = async() => {
    const browser = await puppeteer.launch({
        headless: false,
    });
    return browser;
}
export const normalPage = async (browser: Browser, vw?: number, vh?: number) => {
    const startPage = await browser.newPage(); 
    await startPage.setDefaultNavigationTimeout(0); 
    
    // Setting page view 
    await startPage.setViewport({ width: vw??1366, height: vh??1000}); 
    return startPage;
}

export const normalPageNoImage = async (browser: Browser) => {
    const startPage = await browser.newPage(); 
    await startPage.setDefaultNavigationTimeout(0); 

    //doesn't make image requests
    await startPage.setRequestInterception(true); 
    startPage.on('request', async (request) => { 
        if (request.resourceType() == 'image') { 
            await request.abort(); 
        } else { 
            await request.continue(); 
        } 

    }); 

    
    // Setting page view 
    await startPage.setViewport({ width: 1366, height: 768}); 
    return startPage;
}


export const qry = async (selection: Page|ElementHandle, selector: string, currPage: Page) => {
    try{
        let checker = 0;
        const check = await new Promise(resolve => {
            const interval = setInterval(async () => {
              if (checker>8) {
                resolve(false);
                clearInterval(interval);
              }
              else{
                if(checker>4&&checker<=8&&await selection.$(selector)==null){
                    await currPage.reload()
                    await wait(1200)
                }
                else if(await selection.$(selector)!=null){
                    resolve(true)
                    clearInterval(interval)
                }
                else{
                    checker = checker+1;
                }
              }
            }, 5000);
          });
          console.log('CHECK: ', check)
        return check
    }
    catch(err: any){
        console.log("ERROR: ", err)
        return false
    }
}



export const setStealthBrowser = (func: (browser: Browser)=>any, hl?: boolean) =>{
    puppeteer.use(pluginStealth());
    puppeteer.launch({
        headless: hl??false, 
        executablePath: executablePath(),
        args: [
            '--disable-web-security',
        ],
    }).then(async browser => func(browser))
}


