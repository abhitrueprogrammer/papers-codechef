function Loader ({prop = "m-52"}) {
    return (
      <div className={`${prop} flex justify-center items-center bg-gradient-to-br`}>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white to-transparent opacity-30 animate-ping"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-transparent border-t-white border-b-gray-800 shadow-lg"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#262626] to-[#333333] shadow-inner"></div>
          <div className="absolute inset-7 rounded-full bg-white shadow-lg animate-pulse"></div>
        </div>
      </div>
    );
  };
  
  export default Loader;