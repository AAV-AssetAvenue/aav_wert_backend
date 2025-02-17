import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus } from "@nestjs/common";
import { catchError, firstValueFrom } from "rxjs";

export class PricesHelper {
  constructor(private readonly httpService: HttpService) {}

  async getEthPrice() {
    const { data } = await firstValueFrom(
      this.httpService
        .get("https://api.coinbase.com/v2/prices/ETH-USDT/buy")
        .pipe(
          catchError((error: any) => {
            throw new HttpException(
              error?.response?.data?._embedded?.errors?.[0]?.message,
              error.status || HttpStatus.BAD_REQUEST
            );
          })
        )
    );
    return data.data.amount;
  }

  async getUsdPrice() {
    const { data } = await firstValueFrom(
      this.httpService
        .get(
          "https://api.currencyfreaks.com/v2.0/rates/latest?apikey=fdba8423ad414deaa50a0d49f0f1b6d6&symbols=PKR"
        )
        .pipe(
          catchError((error: any) => {
            throw new HttpException(
              error?.response?.data?._embedded?.errors?.[0]?.message,
              error.status || HttpStatus.BAD_REQUEST
            );
          })
        )
    );
    return data.rates.PKR;
  }

  async convertPkrToUsd(pkrAmount: number) {
    const exchangeRate = await this.getUsdPrice(); // 1 USD = 279 PKR
    const usdAmount = +pkrAmount / +exchangeRate;
    return usdAmount;
  }

  async convertUsdToEth(usdAmount: number) {
    const ethPrice = await this.getEthPrice(); // 1 ETH = 2560 USD
    const ethAmount = usdAmount / ethPrice;
    return ethAmount;
  }
}
