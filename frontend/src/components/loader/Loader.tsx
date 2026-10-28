const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-200" role="status" aria-live="polite">
      <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default Loader;
