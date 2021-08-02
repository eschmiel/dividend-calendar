import { StockPosition, DividendRequestData } from './interfaces';

export function getBearerToken(): Promise<string> {
	return new Promise((resolve, reject) => {
		let requestUrl = 'https://ibo-financials.com/v1/user?user=' + process.env.REACT_APP_USERNAME +
			'&password=' + process.env.REACT_APP_PASSWORD;

		fetch(requestUrl, { method: 'POST' })
			.then(response => response.json())
			.then(data => { resolve( data.token) });
	});
}

export async function getDividendPayments(stockPositions: StockPosition[], bearerToken: string): Promise<DividendRequestData> {
	return new Promise((resolve, reject) => {
		let requestUrl = 'https://ibo-financials.com/v1/dividends/calendar/';
		let symbolQuery = '';
		let sharesQuery = '';

		stockPositions.forEach((position) => {
			symbolQuery += position.symbol + ',';
			sharesQuery += position.shares + ',';
		})

		requestUrl += symbolQuery + '/' + sharesQuery + '/date';

		fetch(requestUrl, { headers: { Authorization: bearerToken } }).then(request => request.json()).then(data => { resolve( data) });

	});
}