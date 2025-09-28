import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";

// Star Rating Component
export function StarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hovered || rating);
        return (
          <motion.button
            key={star}
            type="button"
            onClick={() => onChange(star === rating ? 0 : star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="focus:outline-none transition-all duration-200 cursor-pointer p-0.5 rounded"
          >
            <StarIcon
              className={`h-4 w-4 transition-all duration-200 ${
                isActive
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-slate-300 hover:text-yellow-200"
              }`}
            />
          </motion.button>
        );
      })}
      {rating > 0 && (
        <span className="text-xs text-slate-600 ml-2">{rating}+ stars</span>
      )}
    </div>
  );
}

// Price Range Component
export function PriceRange({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const [localMin, setLocalMin] = useState(value[0].toString());
  const [localMax, setLocalMax] = useState(value[1].toString());

  useEffect(() => {
    setLocalMin(value[0].toString());
    setLocalMax(value[1].toString());
  }, [value]);

  const handleMinBlur = () => {
    const numericValue = parseInt(localMin) || min;
    const clampedValue = Math.max(min, Math.min(numericValue, value[1]));
    setLocalMin(clampedValue.toString());
    onChange([clampedValue, value[1]]);
  };

  const handleMaxBlur = () => {
    const numericValue = parseInt(localMax) || max;
    const clampedValue = Math.min(max, Math.max(numericValue, value[0]));
    setLocalMax(clampedValue.toString());
    onChange([value[0], clampedValue]);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-slate-600">
        <span>€{value[0]}</span>
        <span>€{value[1]}</span>
      </div>
      <div className="flex space-x-2">
        <Input
          type="number"
          min={min}
          max={max}
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          onBlur={handleMinBlur}
          className="h-8 text-xs bg-white border-slate-200 focus:border-slate-400"
          placeholder={`Min (${min})`}
        />
        <Input
          type="number"
          min={min}
          max={max}
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          onBlur={handleMaxBlur}
          className="h-8 text-xs bg-white border-slate-200 focus:border-slate-400"
          placeholder={`Max (${max})`}
        />
      </div>
    </div>
  );
}

