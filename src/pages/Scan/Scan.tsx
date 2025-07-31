import React, { useState, useEffect, useRef } from 'react';
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
  const [activeTab, setActiveTab] = useState<string>('DAMM V2'); // Track active tab
  const [sortOption, setSortOption] = useState<string>('created_at_desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map sortOption to API parameters for DAMM V2 and DLMM
  const getApiSortParams = (option: string, tab: string) => {
    if (tab === 'DAMM V2') {
      switch (option) {
        case 'tvl_asc':
          return { order_by: 'tvl', order: 'asc' };
        case 'tvl_desc':
          return { order_by: 'tvl', order: 'desc' };
        case 'created_at_asc':
          return { order_by: 'created_at_slot_timestamp', order: 'asc' };
        case 'created_at_desc':
          return { order_by: 'created_at_slot_timestamp', order: 'desc' };
        default:
          return { order_by: 'created_at_slot_timestamp', order: 'desc' };
      }
    } else if (tab === 'DLMM') {
      switch (option) {
        case 'tvl_asc':
          return { order_by: 'tvl', order: 'asc' };
        case 'tvl_desc':
          return { order_by: 'tvl', order: 'desc' };
        case 'volume_asc':
          return { order_by: 'volume', order: 'asc' };
        case 'volume_desc':
          return { order_by: 'volume', order: 'desc' };
        case 'volume30m_asc':
          return { order_by: 'volume30m', order: 'asc' };
        case 'volume30m_desc':
          return { order_by: 'volume30m', order: 'desc' };
        case 'volume1h_asc':
          return { order_by: 'volume1h', order: 'asc' };
        case 'volume1h_desc':
          return { order_by: 'volume1h', order: 'desc' };
        case 'volume2h_asc':
          return { order_by: 'volume2h', order: 'asc' };
        case 'volume2h_desc':
          return { order_by: 'volume2h', order: 'desc' };
        case 'volume4h_asc':
          return { order_by: 'volume4h', order: 'asc' };
        case 'volume4h_desc':
          return { order_by: 'volume4h', order: 'desc' };
        case 'volume12h_asc':
          return { order_by: 'volume12h', order: 'asc' };
        case 'volume12h_desc':
          return { order_by: 'volume12h', order: 'desc' };
        case 'feetvlratio_asc':
          return { order_by: 'feetvlratio', order: 'asc' };
        case 'feetvlratio_desc':
          return { order_by: 'feetvlratio', order: 'desc' };
        case 'feetvlratio30m_asc':
          return { order_by: 'feetvlratio30m', order: 'asc' };
        case 'feetvlratio30m_desc':
          return { order_by: 'feetvlratio30m', order: 'desc' };
        case 'feetvlratio1h_asc':
          return { order_by: 'feetvlratio1h', order: 'asc' };
        case 'feetvlratio1h_desc':
          return { order_by: 'feetvlratio1h', order: 'desc' };
        case 'feetvlratio2h_asc':
          return { order_by: 'feetvlratio2h', order: 'asc' };
        case 'feetvlratio2h_desc':
          return { order_by: 'feetvlratio2h', order: 'desc' };
        case 'feetvlratio4h_asc':
          return { order_by: 'feetvlratio4h', order: 'asc' };
        case 'feetvlratio4h_desc':
          return { order_by: 'feetvlratio4h', order: 'desc' };
        case 'feetvlratio12h_asc':
          return { order_by: 'feetvlratio12h', order: 'asc' };
        case 'feetvlratio12h_desc':
          return { order_by: 'feetvlratio12h', order: 'desc' };
        case 'lm_asc':
          return { order_by: 'lm', order: 'asc' };
        case 'lm_desc':
          return { order_by: 'lm', order: 'desc' };
        default:
          return { order_by: 'volume1h', order: 'asc' };
      }
    }
    return { order_by: 'volume1h', order: 'asc' };
  };

  // Fetch data for DAMM V2 tab
  const fetchDammV2Tokens = async (search: string) => {
    try {
      setLoading(true);
      const { order_by, order } = getApiSortParams(sortOption, 'DAMM V2');
      const url = new URL(`https://dammv2-api.meteora.ag/pools`);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '100');
      url.searchParams.set('order_by', order_by);
      url.searchParams.set('order', order);
  
      if (search) {
        const trimmed = search.trim();
        const isPossibleMint = /^[-_a-zA-Z0-9]{32,44}$/.test(trimmed); // kira-kira pattern base58
        if (isPossibleMint) {
          url.searchParams.set('token_a_mint', trimmed);
        } else {
          url.searchParams.set('token_a_symbol', trimmed.toUpperCase());
        }
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch DAMM V2 data');

      const { data } = await response.json();

      const mappedTokens: TokenData[] = data.map((pool: any, index: number) => ({
        id: index + 1,
        symbol: pool.token_a_symbol,
        poolName: pool.pool_name,
        poolAddress: pool.pool_address,
        contract: pool.token_a_mint,
        imageUri: 'https://prod-tensor-creators-s3.s3.us-east-1.amazonaws.com/image/adf0c9f9-8438-4ed3-862a-b82d8f380495',
        TVL: Number(pool.tvl) || 0, // Ensure TVL is a number
        '24Fee': Number(pool.fee24h) || 0, // Ensure fee is a number
        createdAt: timeAgo(pool.created_at_slot_timestamp),
        timestamp: pool.created_at_slot_timestamp,
      }));

      const uniqueTokens = Array.from(
        new Map(mappedTokens.map((token) => [token.poolName, token])).values()
      );

      setTokens(uniqueTokens);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Error fetching DAMM V2 token data. Please try again later.');
    }
  };

  // Fetch data for DLMM tab
  const fetchDlmmTokens = async (search: string) => {
    try {
      setLoading(true);
      const { order_by, order } = getApiSortParams(sortOption, 'DLMM');

      const url = new URL(`https://dlmm-api.meteora.ag/pair/all_with_pagination`);
      // url.searchParams.set('page', '1');
      // url.searchParams.set('limit', '100');
      url.searchParams.set('sort_key', order_by);
      url.searchParams.set('order', order);
  
      if (search) {
        const trimmed = search.trim();
        url.searchParams.set('search_term', trimmed)
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch DAMM V2 data');

      const data  = await response.json();
      const mappedTokens: TokenData[] = data.pairs.map((pair: any, index: number) => {
        const poolName = `${pair.name || 'Unknown'}`;
        const timestamp = Math.floor(Date.now() / 1000); // Placeholder since created_at is not available
        // Normalize TVL and fees to two decimal places for consistent USD formatting
        const tvl = Number(pair.liquidity) ? Number(Number(pair.liquidity).toFixed(2)) : 0;
        const fees = Number(pair.fees_24h) ? Number(Number(pair.fees_24h).toFixed(2)) : 0;
        const symbol = pair.name ? pair.name.split('-')[0] : 'Unknown';
        return {
          id: index + 1,
          symbol: symbol,
          poolName,
          poolAddress: pair.address,
          contract: pair.mint_x || '',
          imageUri: 'https://prod-tensor-creators-s3.s3.us-east-1.amazonaws.com/image/adf0c9f9-8438-4ed3-862a-b82d8f380495',
          TVL: tvl,
          '24Fee': fees,
          createdAt: "-",
          timestamp,
        };
      });

      setTokens(mappedTokens);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error in fetchDlmmTokens:', err);
      setError('Error fetching DLMM token data. Please try again later.');
    }
  };

  // Handle tab switch
  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    setTokens([]); // Clear tokens when switching tabs
    if (tab === 'DAMM V2') {
      fetchDammV2Tokens(searchTerm);
    } else if (tab === 'DLMM') {
      fetchDlmmTokens(searchTerm);
    }
  };

  // Handle sort option selection
  const handleSortSelect = (option: string) => {
    setSortOption(option);        // ini akan trigger useEffect
    setIsDropdownOpen(false);
    setTokens([]);                // kosongkan data lama
    setLoading(true);
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
    if (activeTab === 'DAMM V2') {
      fetchDammV2Tokens(searchTerm);
    } else if (activeTab === 'DLMM') {
      fetchDlmmTokens(searchTerm);
    }
  
    let intervalId: NodeJS.Timeout | null = null;
    if (isAutoRefresh) {
      intervalId = setInterval(() => {
        if (activeTab === 'DAMM V2') {
          fetchDammV2Tokens(searchTerm);
        } else if (activeTab === 'DLMM') {
          fetchDlmmTokens(searchTerm);
        }
      }, 10000);
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRefresh, activeTab, sortOption, searchTerm]);  

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
          <button
            className={`text-sm hover:opacity-80 ${activeTab === 'DAMM V2' ? 'text-orange-500' : 'text-gray-400'}`}
            onClick={() => handleTabSwitch('DAMM V2')}
          >
            DAMM V2
          </button>
          <button
            className={`text-sm hover:opacity-80 ${activeTab === 'DLMM' ? 'text-orange-500' : 'text-gray-400'}`}
            onClick={() => handleTabSwitch('DLMM')}
          >
            DLMM
          </button>
        </div>
        <div className="w-full md:flex-1 md:mx-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <div className="relative" ref={dropdownRef}>
            <button
              className="text-gray-400 text-sm hover:opacity-80 flex items-center gap-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <BiSortAlt2 className="text-lg" /> Sort By
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 border border-gray-700 bg-[#18181a] rounded-md shadow-lg z-10">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    sortOption === 'tvl_asc'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleSortSelect('tvl_asc')}
                >
                  TVL Asc
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    sortOption === 'tvl_desc'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleSortSelect('tvl_desc')}
                >
                  TVL Desc
                </button>
                {activeTab === 'DAMM V2' && (
                  <>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'created_at_asc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('created_at_asc')}
                    >
                      Created At Asc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'created_at_desc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('created_at_desc')}
                    >
                      Created At Desc
                    </button>
                  </>
                )}
                {activeTab === 'DLMM' && (
                  <>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume_asc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume_asc')}
                    >
                      Volume Asc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume_desc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume_desc')}
                    >
                      Volume Desc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume30m_asc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume30m_asc')}
                    >
                      Volume 30m Asc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume30m_desc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume30m_desc')}
                    >
                      Volume 30m Desc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume1h_asc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume1h_asc')}
                    >
                      Volume 1h Asc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume1h_desc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume1h_desc')}
                    >
                      Volume 1h Desc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume2h_asc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume2h_asc')}
                    >
                      Volume 2h Asc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume2h_desc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume2h_desc')}
                    >
                      Volume 2h Desc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume4h_asc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume4h_asc')}
                    >
                      Volume 4h Asc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume4h_desc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume4h_desc')}
                    >
                      Volume 4h Desc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume12h_asc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume12h_asc')}
                    >
                      Volume 12h Asc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'volume12h_desc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('volume12h_desc')}
                    >
                      Volume 12h Desc
                   </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'lm_asc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('lm_asc')}
                    >
                      LM Asc
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        sortOption === 'lm_desc'
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => handleSortSelect('lm_desc')}
                    >
                      LM Desc
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-400">Loading {activeTab} token data...</p>
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
                        href={`https://www.meteora.ag/${activeTab === 'DLMM'?'dlmm':'dammv2'}/${token.poolAddress}`}
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