import React from "react";
import { Link } from "react-router-dom";

const Pet = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold mb-6">Pet Healthcare</h1>
      <p className="mb-6 text-lg text-gray-700">
        Veterinary care for your beloved pets. Connect with expert veterinarians
        and get the best for your pet.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default Pet;