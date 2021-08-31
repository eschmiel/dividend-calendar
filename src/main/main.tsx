import React, { useReducer, useEffect } from 'react';
import {
    months,
    MonthData,
} from './monthData';
import {
    MainState,
    StockPosition,
    DividendPayment,
    ChangeStockPositionsPayload
} from './mainTypes';
import { DividendPaymentResponseData } from '../messenger/messengerTypes';
import {getDividendPayments } from '../messenger/messenger';
import DividendSearch from './dividend search/dividendSearch';
import mainReducer from './mainReducer';
import CalendarMonth from './calendar/calendarMonth';
import MonthlyPaymentAggregate from './individual components/monthlyPaymentAggregate';
import Summary from './individual components/summary';
import {
    cloneStockPositions,
    getInitialData,
    parseDividendPaymentResponseDataIntoDividendPayments
} from './mainHelperFunctions';
import './main.css';

let currentDate = new Date();

const defaultState: MainState = {
    selectedMonth: currentDate.getMonth() + 1,
    selectedYear: currentDate.getFullYear(),
    user: '',
    bearerTokenData: { token: '', ttl: 0, issuedAt: 0, expiration: 0 },
    stockPositions: [],
    dividendPayments: []
};

export default function Main() {
    const [state, dispatch] = useReducer(mainReducer, defaultState);

    useEffect(() => {
        getInitialData().then((initialData) => {
            dispatch({ type: 'setInitialData', payload: initialData });
        });
    }, [])

    async function addStockPosition(newSymbol: string, newShares: number) {
        if (!state.stockPositions.some((position) => position.symbol === newSymbol)) {

            let newStockPositions: StockPosition[] = cloneStockPositions(state.stockPositions);
            newStockPositions.push({ symbol: newSymbol, shares: newShares });

            let dividendPaymentResponseData: DividendPaymentResponseData = await getDividendPayments(newStockPositions, state.bearerTokenData, state.user);
            let newDividendPayments: DividendPayment[] = parseDividendPaymentResponseDataIntoDividendPayments(dividendPaymentResponseData);

            let changeStockPositionsPayload: ChangeStockPositionsPayload = {
                stockPositions: newStockPositions,
                dividendPayments: newDividendPayments
            };

            dispatch({ type: 'changeStockPositions', payload: changeStockPositionsPayload });
        }          
    }

    let dateObject = new Date();
    let monthObject = Object.values(months).find(monthObject => monthObject.monthNumber === state.selectedMonth);
    
    dateObject.setMonth(state.selectedMonth - 1);
    dateObject.setFullYear(state.selectedYear);
    dateObject.setDate(1);

    let monthData: MonthData = Object.assign({ startingDay: dateObject.getDay() }, monthObject);
    let dividendPaymentsForMonth: DividendPayment[] = [];

    state.dividendPayments.forEach((dividendPayment: DividendPayment) => {
        if (dividendPayment.year === state.selectedYear
            && dividendPayment.month === state.selectedMonth)
            dividendPaymentsForMonth.push(dividendPayment);
    });

    return (
        <div>
            <div id='calendar'>
                <div id='cycleMonthButtonContainer'>
                    <div className='cycleMonthButton' onClick={() => dispatch({ type: 'decrement' })}>&lt;</div>
                    {state.selectedYear}
                    <div className='cycleMonthButton' onClick={() => dispatch({ type: 'increment' })}>&gt;</div>
                </div>
                <CalendarMonth month={monthData} dividendPayments={dividendPaymentsForMonth}/>
				<MonthlyPaymentAggregate dividendPayments={dividendPaymentsForMonth}/>
            </div>
            <DividendSearch dividendPayments={state.dividendPayments} addStockPosition={addStockPosition}/>
			<Summary month={monthData} year={state.selectedYear} dividendPayments={state.dividendPayments}/>
        </div>
    );    
}