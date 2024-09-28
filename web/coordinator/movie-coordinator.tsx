import * as web3 from "@solana/web3.js";
import { Movie } from "../models/movie-model";
import bs58 from 'bs58'

const MOVIE_REVIEW_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";
 
export class MovieCoordinator {
    static accounts: web3.PublicKey[] = [];
    
    static async prefetchAccounts(connection: web3.Connection, search: string) {
        const config : web3.GetProgramAccountsConfig = {
        dataSlice: {offset: 6, length: 5},
        filters: search === '' ? [] : [
            {
              memcmp:
                {
                  offset: 6,
                  bytes: bs58.encode(Buffer.from(search))
                }
            }
          ]
    
    }
        const accountInfos = await connection.getProgramAccounts(new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID), config)
        const accountsArray = Array.from(accountInfos);
        accountsArray.sort( (a, b) => {
            
            const dataA = a.account.data
            const dataB = b.account.data
            return dataA.compare(dataB)
          })
        this.accounts = accountsArray.map(accountInfo => accountInfo.pubkey )

    }
   
    static async fetchPage(
      connection: web3.Connection,
      page: number,
      perPage: number,
    ): Promise<Movie[]> {
        const accountsToFetch = this.accounts.slice((page -1)*perPage, (page)*perPage)
       const accountInfos = await connection.getMultipleAccountsInfo(accountsToFetch)
       const movieWithNulls =  accountInfos.map(accountInfo => Movie.deserialize(accountInfo?.data))
       return movieWithNulls.filter(movie => movie!=null )as Movie[];

    }
}