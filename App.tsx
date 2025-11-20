import React, { useState, useCallback } from 'react';
import { Search, MapPin, CloudLightning, Info, Loader2 } from 'lucide-react';
import VietnamMap from './components/VietnamMap';
import AnalysisPanel from './components/AnalysisPanel';
import { PROVINCES } from './constants';
import { analyzeRainfall } from './services/geminiService';
import { ProvinceData, AnalysisResult, LoadingState } from './types';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle province selection (click on map or search)
  const handleSelectProvince = useCallback(async (province: ProvinceData) => {
    setSelectedProvince(province);
    setSearchQuery(province.name);
    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setAnalysisData(null);

    try {
      const result = await analyzeRainfall(province.name);
      setAnalysisData(result);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Không thể lấy dữ liệu. Vui lòng thử lại sau.");
      setLoadingState(LoadingState.ERROR);
    }
  }, []);

  // Filter provinces for search autocomplete
  const filteredProvinces = searchQuery
    ? PROVINCES.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 font-sans relative">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200 animate-float">
            <CloudLightning className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">VinaRain <span className="text-blue-600">AI Expert</span></h1>
            <p className="text-slate-500 text-sm">Chuyên gia phân tích lượng mưa & thiên tai</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group z-50">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            placeholder="Tìm kiếm tỉnh thành..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Autocomplete Dropdown */}
          {searchQuery && filteredProvinces.length > 0 && !selectedProvince && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
              {filteredProvinces.map(p => (
                <div
                  key={p.id}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2 transition-colors"
                  onClick={() => handleSelectProvince(p)}
                >
                  <MapPin size={16} className="text-slate-400" />
                  <span className="text-slate-700">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Map (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-1 rounded-[2rem] shadow-xl relative group">
            <VietnamMap 
              selectedProvince={selectedProvince} 
              onProvinceSelect={handleSelectProvince} 
            />
            {/* Map Interaction Hint */}
            {!selectedProvince && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md flex items-center gap-2 shadow-lg animate-pulse pointer-events-none">
                <Info size={16} />
                Chọn một tỉnh để phân tích
              </div>
            )}
          </div>
          
          {/* Introduction Card (Visible when idle) */}
          {loadingState === LoadingState.IDLE && !selectedProvince && (
            <div className="glass-panel p-6 rounded-3xl border border-white/60">
              <h3 className="font-bold text-lg text-slate-800 mb-2">Chào mừng đến với VinaRain AI</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Hệ thống sử dụng trí tuệ nhân tạo Gemini kết hợp với Google Search để cung cấp dữ liệu thời gian thực về lượng mưa tại 63 tỉnh thành Việt Nam. 
                Đặc biệt phân tích tác động của hiện tượng <strong>La Nina năm 2025</strong> đối với xu thế thiên tai.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Analysis Dashboard (Span 7) */}
        <div className="lg:col-span-7 min-h-[500px]">
          
          {/* Loading State */}
          {loadingState === LoadingState.LOADING && (
            <div className="h-full flex flex-col items-center justify-center glass-panel rounded-3xl p-12 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Đang phân tích dữ liệu...</h3>
                <p className="text-slate-500 mt-2 max-w-md">
                  AI đang tìm kiếm số liệu lượng mưa 10 năm qua và đánh giá rủi ro La Nina cho 
                  <span className="font-bold text-blue-600 ml-1">{selectedProvince?.name}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {loadingState === LoadingState.ERROR && (
            <div className="h-full flex flex-col items-center justify-center glass-panel rounded-3xl p-12 text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                 <Info size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800">Đã xảy ra lỗi</h3>
               <p className="text-slate-500 mt-2">{errorMsg}</p>
               <button 
                 onClick={() => selectedProvince && handleSelectProvince(selectedProvince)}
                 className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
               >
                 Thử lại
               </button>
            </div>
          )}

          {/* Success Analysis State */}
          {loadingState === LoadingState.SUCCESS && analysisData && (
            <AnalysisPanel data={analysisData} />
          )}

           {/* Empty State Placeholder */}
           {loadingState === LoadingState.IDLE && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-12 text-slate-400 select-none">
              <MapPin size={64} className="mb-4 opacity-20" />
              <p>Chọn địa điểm trên bản đồ để xem báo cáo</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
