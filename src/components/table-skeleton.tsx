export default function TableSkeleton({ columns = 7 }: { columns?: number }) {
  const skeletonRows = Array(6).fill(null);

  return (
    <tbody>
      {skeletonRows.map((_, index) => (
        <tr key={index} className="animate-pulse border-b border-gray-200">
          {Array(columns)
            .fill(null)
            .map((_, colIndex) => (
              <td key={colIndex} className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </td>
            ))}
        </tr>
      ))}
    </tbody>
  );
}