import React, { useState, useEffect, useRef } from 'react';
import { HiAdjustments } from 'react-icons/hi';
import { BiSortAlt2 } from 'react-icons/bi';
import { FiRefreshCw } from 'react-icons/fi';

interface TokenData {
  id: number;
  symbol: string;
  poolName: string;
  poolAddress: string;
  contract: string;
  imageUri: string;
  TVL: number;
  '24Fee': number;
  createdAt: string;
  timestamp: number;
}

// Time ago function
const timeAgo = (timestamp: number): string => {
  const now = Date.now() / 1000; // Current time in seconds
  const diff = now - timestamp;

  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const Scan: React.FC = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('created_at_desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true); // New state for auto-refresh
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map sortOption to API parameters
  const getApiSortParams = (option: string) => {
    switch (option) {
      case 'tvl_asc':
        return { order_by: 'tvl', order: 'asc' };
      case 'tvl_desc':
        return { order_by: 'tvl', order: 'desc' };
      case 'created_at_asc':
        return { order_by: 'created_at_slot_timestamp', order: 'asc' };
      case 'created_at_desc':
      default:
        return { order_by: 'created_at_slot_timestamp', order: 'desc' };
    }
  };

  // Fetch data from Meteora API
  const fetchTokens = async () => {
    try {
      setLoading(true);
      const { order_by, order } = getApiSortParams(sortOption);
      const response = await fetch(
        `https://dammv2-api.meteora.ag/pools?page=1&limit=100&order_by=${order_by}&order=${order}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch data from Meteora API');
      }
      const { data } = await response.json();

      // Map API data to TokenData interface
      const mappedTokens: TokenData[] = data.map((pool: any, index: number) => ({
        id: index + 1,
        symbol: pool.token_a_symbol,
        poolName: pool.pool_name,
        poolAddress: pool.pool_address,
        contract: pool.token_a_mint,
        imageUri: 'https://prod-tensor-creators-s3.s3.us-east-1.amazonaws.com/image/adf0c9f9-8438-4ed3-862a-b82d8f380495',
        TVL: pool.tvl || 0,
        '24Fee': pool.fee24h || 0,
        createdAt: timeAgo(pool.created_at_slot_timestamp),
        timestamp: pool.created_at_slot_timestamp,
      }));

      // Remove duplicates by poolName
      const uniqueTokens = Array.from(
        new Map(mappedTokens.map((token) => [token.poolName, token])).values()
      );

      setTokens(uniqueTokens);
      setLoading(false);
    } catch (err) {
      setError('Error fetching token data. Please try again later.');
      setLoading(false);
    }
  };

  // Handle sort option selection
  const handleSortSelect = (option: string) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    fetchTokens();
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchTokens();
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefresh(!isAutoRefresh);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data on component mount and set up auto-refresh
  useEffect(() => {
    fetchTokens();

    let intervalId: NodeJS.Timeout | null = null;
    if (isAutoRefresh) {
      intervalId = setInterval(() => {
        fetchTokens();
      }, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRefresh]); // Depend on isAutoRefresh to restart interval when toggled

  return (
    <div className="min-h-screen bg-black text-white mt-7">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-mono mb-2">Dive Deep into Solana’s Liquidity</h1>
        <p className="text-gray-400 text-xs md:text-base">
          Scan Fast • Deepest Liquidity • Trade Smart
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-3 text-base gap-4">
        <div className="w-full md:w-auto flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 items-center">
          <button className="text-orange-500 text-sm hover:opacity-80">DAMM V2</button>
          <button className="text-gray-400 text-sm hover:opacity-80">DLMM</button>
        </div>
        <div className="w-full md:flex-1 md:mx-6">
          <input
            type="text"
            placeholder="Search by contract address, name, or symbol"
            className="w-full border border-gray-700 rounded text-gray-400 px-4 py-2 text-sm hover:border-orange-500 focus:outline-none focus:text-white focus:border-orange-500"
          />
        </div>

        <div className="w-full md:w-auto flex justify-center md:justify-end space-x-6">
          <button
            className={`text-sm hover:opacity-80 flex items-center gap-2 ${
              isAutoRefresh ? 'text-orange-500' : 'text-gray-400'
            }`}
            onClick={toggleAutoRefresh}
            title={isAutoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            <FiRefreshCw className="text-lg" /> {isAutoRefresh ? 'Auto-Refresh' : 'Auto-Refresh'}
          </button>
          {/* <button className="text-gray-400 text-sm hover:opacity-80 flex items-center gap-2">
            <HiAdjustments className="text-lg" /> Filters
          </button> */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="text-gray-400 text-sm hover:opacity-80 flex items-center gap-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <BiSortAlt2 className="text-lg" /> Sort By
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  onClick={() => handleSortSelect('tvl_asc')}
                >
                  TVL Ascending
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  onClick={() => handleSortSelect('tvl_desc')}
                >
                  TVL Descending
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  onClick={() => handleSortSelect('created_at_asc')}
                >
                  Created At Ascending
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  onClick={() => handleSortSelect('created_at_desc')}
                >
                  Created At Descending
                </button>
              </div>
            )}
          </div>
          {/* <button
            className="text-gray-400 text-sm hover:opacity-80 flex items-center gap-2"
            onClick={handleRefresh}
            title="Refresh data"
          >
            <FiRefreshCw className="text-lg" /> Refresh
          </button> */}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-400">Loading token data...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="px-2 md:px-6 overflow-x-auto">
          <div className="min-w-[1200px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-3 px-2 font-normal w-[50px]">★</th>
                  <th className="text-left px-2 font-normal w-[150px]">Token Ⓜ</th>
                  <th className="text-right px-2 font-normal w-[100px]">Symbol</th>
                  <th className="text-right px-2 font-normal w-[100px]">Pool Name</th>
                  <th className="text-right px-2 font-normal w-[100px]">TVL</th>
                  <th className="text-right px-2 font-normal w-[100px]">24H Fee</th>
                  <th className="text-right px-2 font-normal w-[100px]">Created At</th>
                  <th className="text-right px-2 font-normal w-[100px]">Links</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr key={token.id} className="border-b border-gray-800/50 hover:bg-[#1e2025]">
                    <td className="py-4 px-2 whitespace-nowrap">☆ {token.id}</td>
                    <td className="px-2">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <div className="text-white text-sm truncate">{token.poolName}</div>
                          <div className="flex items-center gap-1">
                            <div className="text-gray-400 text-xs">{token.symbol}</div>
                            <a
                              href={`https://gmgn.ai/sol/token/${token.contract}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-500 hover:underline"
                            >
                              CA
                            </a>
                            <a
                              href={`https://www.meteora.ag/dammv2/${token.poolAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-500 hover:underline"
                            >
                              PA
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-2 whitespace-nowrap">{token.symbol}</td>
                    <td className="text-right px-2 whitespace-nowrap">{token.poolName}</td>
                    <td className="text-right px-2 whitespace-nowrap">
                      {token.TVL.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right px-2 whitespace-nowrap">
                      {token['24Fee'].toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right px-2 whitespace-nowrap">{token.createdAt}</td>
                    <td className="text-right px-2">
                      <a
                        href={`https://www.jup.ag/tokens/${token.contract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline mr-2"
                      >
                        Jupiter
                      </a>
                      <a
                        href={`https://www.gmgn.ai/sol/token/${token.contract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline mr-2"
                      >
                        GMGN
                      </a>
                      <a
                        href={`https://www.meteora.ag/dammv2/${token.poolAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline mr-2"
                      >
                        Meteora
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scan;