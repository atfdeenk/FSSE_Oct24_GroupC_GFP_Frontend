import React from "react";

interface ReviewCardProps {
  productName: string;
  stars: number; // 0-5
  date: string;
  verified?: boolean;
  children: React.ReactNode; // Review text
}

const ReviewCard: React.FC<ReviewCardProps> = ({ productName, stars, date, verified, children }) => {
  return (
    <div className="border-b border-white/10 pb-6 last:border-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center mb-1">
            <div className="flex text-amber-500 mr-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4" fill={i < stars ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={i < stars ? 0 : 2} d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                </svg>
              ))}
            </div>
            <h3 className="text-lg font-medium text-white">{productName}</h3>
          </div>
          <p className="text-white/60 text-sm mb-2">{date}</p>
        </div>
        {verified && (
          <div className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-sm">
            Verified Purchase
          </div>
        )}
      </div>
      <p className="text-white/80">{children}</p>
    </div>
  );
};

export default ReviewCard;
