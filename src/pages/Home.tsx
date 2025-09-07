import manWithPet from "../assets/man-with-pet.jpg"; // ✅ forward slash, not backslash

function Home() {
  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="flex items-center space-x-2">
          <img
            src="https://img.icons8.com/ios-filled/50/4a90e2/medical-doctor.png"
            className="h-6 w-6"
            alt="logo"
          />
          <span className="text-xl font-semibold text-gray-700">SwasthSetu</span>
        </div>
        <div>
          <button className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
            Settings
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="flex justify-center space-x-6 mt-6">
        <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">
          Services
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-blue-600">
          Doctor Chat
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-blue-600">
          Photo Diagnosis
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-blue-600">
          Settings
        </button>
      </div>

      {/* Heading */}
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold text-gray-800">
          Choose Your Healthcare Service
        </h1>
        <p className="text-gray-600 mt-2">
          SwasthSetu provides comprehensive healthcare for both humans and pets.
          Click on the image below to get started.
        </p>
      </div>

      {/* Main Image (✅ local import use kar raha hai) */}
      <div className="flex justify-center mt-8">
        <img
          src={manWithPet}
          alt="doctor with pet"
          className="rounded-xl shadow-lg max-w-3xl"
        />
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
        {/* Human Healthcare */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="flex items-center text-lg font-semibold text-gray-800">
            <img
              src="https://img.icons8.com/ios-filled/24/4a90e2/user.png"
              className="mr-2"
              alt="user"
            />
            Human Healthcare
          </h2>
          <p className="text-gray-500 text-sm">Complete medical care for people</p>
          <ul className="mt-4 text-gray-600 text-sm space-y-1 list-disc list-inside">
            <li>Video/Audio consultations</li>
            <li>12+ Indian languages</li>
            <li>5000+ verified doctors</li>
            <li>Emergency support 24/7</li>
          </ul>
          <button className="mt-5 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Access Human Healthcare
          </button>
        </div>

        {/* Pet Healthcare */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="flex items-center text-lg font-semibold text-gray-800">
            <img
              src="https://img.icons8.com/ios-filled/24/4a90e2/dog.png"
              className="mr-2"
              alt="dog"
            />
            Pet Healthcare
          </h2>
          <p className="text-gray-500 text-sm">Veterinary care for your beloved pets</p>
          <ul className="mt-4 text-gray-600 text-sm space-y-1 list-disc list-inside">
            <li>Expert veterinarians</li>
            <li>Behavioral consultations</li>
            <li>Emergency pet care</li>
            <li>Nutrition guidance</li>
          </ul>
          <button className="mt-5 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Access Pet Healthcare
          </button>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center gap-6 mt-10 mb-8">
        <button className="px-6 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
          Quick Consultation
        </button>
        <button className="px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
          Emergency: 102
        </button>
      </div>
    </div>
  );
}

export default Home;
