import { Calendar, Gauge, Fuel } from "lucide-react";

interface VehicleInfoProps {
  year?: number | null;
  mileage?: number | null;
  fuelType?: string | null;
  className?: string;
}

const VehicleInfo = ({ year, mileage, fuelType, className = "" }: VehicleInfoProps) => {
  if (!year && !mileage && !fuelType) return null;

  const formattedMileage =
    typeof mileage === "number" ? `${mileage.toLocaleString("es-PY")} km` : null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground ${className}`}
    >
      {year && (
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {year}
        </span>
      )}
      {formattedMileage && (
        <span className="inline-flex items-center gap-1">
          <Gauge className="h-3 w-3" />
          {formattedMileage}
        </span>
      )}
      {fuelType && (
        <span className="inline-flex items-center gap-1 capitalize">
          <Fuel className="h-3 w-3" />
          {fuelType}
        </span>
      )}
    </div>
  );
};

export default VehicleInfo;