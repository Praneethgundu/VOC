"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DispenseModal({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white p-6 rounded-lg w-[500px]">

        <h2 className="text-xl font-bold mb-4">
          Dispense Medicine
        </h2>

        <input
          placeholder="Patient ID"
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          placeholder="Medicine Name"
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          placeholder="Quantity"
          className="border p-3 w-full mb-4 rounded"
        />

        <button className="bg-red-900 text-white px-4 py-2 rounded">
          Dispense
        </button>

        <button
          onClick={onClose}
          className="ml-3 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>

      </div>

    </div>
  );
}