import React, { useMemo, useState } from 'react'; // Import useState
import { sortData } from '../lib/utils';


const TopSendersTable = ({ transactions }) => {
  const [sortColumn, setSortColumn] = useState('amount'); // Initialize
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

    const topSenders = useMemo(() => {
      // ... (rest of your aggregation logic)
      if (!transactions || transactions.length === 0) {
        return [];
      }

      const senderCounts = {};
      const senderTotals = {};

      transactions.forEach((tx) => {
        if (tx.payer) {
          senderCounts[tx.payer] = (senderCounts[tx.payer] || 0) + 1;
          senderTotals[tx.payer] = (senderTotals[tx.payer] || 0) + Math.abs(tx.amount);
        }
      });
        const senderData = Object.entries(senderTotals).map(([sender, amount]) => ({
            sender,
            amount,
            count: senderCounts[sender] || 0, // ensure count
        }));

        return senderData;
    }, [transactions]);


  const sortedSenders = useMemo(() => {
    return sortData(topSenders, sortColumn, sortDirection);
  }, [topSenders, sortColumn, sortDirection]);

    return (
         <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
              <div className="text-2xl font-semibold leading-none tracking-tight">Top 25 Senders</div>
            </div>
            <div className="p-6 pt-0">
             <div className="h-96 overflow-auto">
                <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('sender')}>
                      Sender {sortColumn === 'sender' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('amount')}>
                      Amount (ETB) {sortColumn === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('count')}>
                      Count {sortColumn === 'count' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                    {sortedSenders.map((item, index) => (
                    <tr key={index} className="border-t">
                        <td className="p-2">{item.sender}</td>
                        <td className="p-2 text-right">{item.amount.toFixed(2)}</td>
                        <td className="p-2 text-right">{item.count}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
             </div>
            </div>
        </div>
    );
};

export default TopSendersTable;