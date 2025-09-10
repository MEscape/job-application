import React from "react";
import { Minus, Plus, X, Divide } from "lucide-react";

export const CalculatorApp: React.FC = () => {
  return (
      <div className="w-full h-full bg-gray-100 flex flex-col overflow-hidden rounded-lg shadow-xl border border-gray-200">
        {/* Display */}
        <div className="bg-white text-black p-6 h-32 flex flex-col justify-end border-b border-gray-200">
          <div className="text-right">
            <div className="text-black text-6xl font-extralight leading-none">0</div>
          </div>
        </div>

        {/* Button Grid */}
        <div className="flex-1 p-3 bg-gray-100">
          <div className="grid grid-cols-4 gap-3 h-full">
            {/* Row 1 */}
            <button className="bg-gray-300 hover:bg-gray-200 text-black rounded-full text-lg font-medium transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm">
              AC
            </button>
            <button className="bg-gray-300 hover:bg-gray-200 text-black rounded-full text-lg font-medium transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm">
              ±
            </button>
            <button className="bg-gray-300 hover:bg-gray-200 text-black rounded-full text-lg font-medium transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm">
              %
            </button>
            <button className="bg-orange-500 hover:bg-orange-400 text-white rounded-full transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm">
              <Divide className="w-6 h-6" />
            </button>

            {/* Row 2 */}
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              7
            </button>
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              8
            </button>
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              9
            </button>
            <button className="bg-orange-500 hover:bg-orange-400 text-white rounded-full transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm">
              <X className="w-6 h-6" />
            </button>

            {/* Row 3 */}
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              4
            </button>
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              5
            </button>
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              6
            </button>
            <button className="bg-orange-500 hover:bg-orange-400 text-white rounded-full transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm">
              <Minus className="w-6 h-6" />
            </button>

            {/* Row 4 */}
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              1
            </button>
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              2
            </button>
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              3
            </button>
            <button className="bg-orange-500 hover:bg-orange-400 text-white rounded-full transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm">
              <Plus className="w-6 h-6" />
            </button>

            {/* Row 5 */}
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light col-span-2 transition-all duration-150 flex items-center justify-start pl-8 min-h-0 active:scale-95 shadow-sm border border-gray-200">
              0
            </button>
            <button className="bg-white hover:bg-gray-50 text-black rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm border border-gray-200">
              .
            </button>
            <button className="bg-orange-500 hover:bg-orange-400 text-white rounded-full text-xl font-light transition-all duration-150 flex items-center justify-center min-h-0 active:scale-95 shadow-sm">
              =
            </button>
          </div>
        </div>
      </div>
  );
}