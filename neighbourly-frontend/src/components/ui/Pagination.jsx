import Button from "./Button";

const Pagination = () => {
  return (
    <div className="flex justify-between items-center mt-6">

      <p className="text-sm text-slate-500">
        Showing 1–10 of 128 residents
      </p>

      <div className="flex gap-2">

        <Button variant="outline">
          Previous
        </Button>

        <Button>
          1
        </Button>

        <Button variant="outline">
          2
        </Button>

        <Button variant="outline">
          3
        </Button>

        <Button variant="outline">
          Next
        </Button>

      </div>

    </div>
  );
};

export default Pagination;