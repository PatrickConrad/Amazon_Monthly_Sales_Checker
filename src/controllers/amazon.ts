import { normalPageNoImage } from './../helpers/setPage';
import puppeteer  from "puppeteer-extra";
import { Page, executablePath} from 'puppeteer';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { shortWait } from "../helpers/wait";
import { NextFunction, Request, Response } from 'express';
import { addRow, csvFileToArray, rowToCsvRowString, } from '../helpers/csv';
import { downloadFromFTP, saveToFTP } from '../helpers/FTP';


export const getAmazonSalesData = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const sourceName = req.query.source??'champro'
        const dirExists = existsSync(`./tmp/${sourceName}`)
        if(!dirExists){
            mkdirSync(`./tmp/${sourceName}`)
        }

        const fileExists = `./tmp/${sourceName}/amazon-links.csv`;
        if(!fileExists){
            await downloadFromFTP(`/formatted-data/${sourceName}/amazon-links.csv`, `./tmp/${sourceName}/amazon-links.csv`)
        }

        const fileExistsAlready = existsSync(`./tmp/${sourceName}/amazon-selling-info.csv`)
        const preExisting: string[] = [];
        if(fileExistsAlready){
            const preExistingData = csvFileToArray(`./tmp/${sourceName}/amazon-selling-info.csv`);
            for(let ped=1;ped<preExistingData.currentSheet.length;ped++){
                const asin = preExistingData.getVal(ped, 'ASIN')
                if(!preExisting.includes(asin)){
                    preExisting.push(asin);
                }
            }
        }
        else{
            writeFileSync(`./tmp/${sourceName}/amazon-selling-info.csv`, rowToCsvRowString(['ASIN', 'Amount Sold']), 'utf-8')
        }
        const linksData = await csvFileToArray(`./tmp/${sourceName}/amazon-links.csv`);
        const browser = await puppeteer.launch({headless: false, executablePath: executablePath()})
        for(let cd=1;cd<linksData.currentSheet.length;cd++){
            const asin = linksData.getVal(cd, 'ASIN');
            const link = `https://www.amazon.com/dp/${asin}/?th=1&psc=1`;
            if(!preExisting.includes(asin)){
                await shortWait(100)
                const linkPage = await normalPageNoImage(browser)
                await linkPage.goto(link);
                const checkForLinker: (page: Page, checkTimes: number)=> Promise<boolean> = async (page: Page,  checkTimes: number) =>{
                    if(checkTimes>10){
                        return false
                    }
                    await shortWait(1000);
                    const exister = await page.$('a#bylineInfo')
                    if(exister==null){
                        return await checkForLinker(page, checkTimes+1)
                    }
                    else{
                        return true
                    }
                }
                const linkerFound = await checkForLinker(linkPage, 0);
    
                let sold = 'No Data';
                if(linkerFound){
                    const soldTool = await linkPage.$('span#social-proofing-faceout-title-tk_bought');
                    if(soldTool!=null){
                        const textData = await soldTool.evaluate(el=>el.innerText);
                        if(textData!=null&&textData!==''){
                            sold = textData
                        }
                    }
                    // }
                    sold = `${sold}`.replace(/\n/g, '')
                    const fixDbl: (soldStr: string)=>string = (soldStr: string)=>{
                        if(soldStr.includes('  ')){
                            const newStr = soldStr.replace(/\s\s/g,' ');
                            return fixDbl(newStr);
                        }
                        else{
                            return soldStr;
                        }
                    }
                    sold = fixDbl(`${sold}`);
                }
    
    
                addRow(`./tmp/${sourceName}/amazon-selling-info.csv`, [asin, sold])
                await linkPage.close();
            }
           
        }

        await shortWait(10)
        await browser.close();

        const saveFTP = req.query.saveFTP??'';
        if(saveFTP==='true'){
            await saveToFTP(`./tmp/${sourceName}/amazon-selling-info.csv`, `/formatted-data/${sourceName}/amazon-selling-info.csv`, true);
        }
        return res.status(200).json({
            success: true,
        })
    }
    catch(err: any){
        console.log({err})
        return res.status(500).json({
            success: false,
            message: `${err}`
        })
    }
}