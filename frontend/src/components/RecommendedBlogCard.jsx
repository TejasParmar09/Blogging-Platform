import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';

const RecommendedBlogCard = ({ blog }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="flex bg-[#1e1e2f] hover:bg-[#27293d] transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-[#2c2f44]"
    >
      {blog.image && (
        <div className="w-2/5 flex-shrink-0">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="w-3/5 p-4 flex flex-col justify-between text-white">
        <div>
          <h3 className="text-lg font-semibold mb-1 line-clamp-2 text-white">
            {blog.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {blog.description}
          </p>
        </div>
        <span className="text-xs text-gray-500 mt-2">
          {formatDate(blog.createdAt)}
        </span>
      </div>
    </Link>
  );
};

export default RecommendedBlogCard;
