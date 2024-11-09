import React from "react";
import { MdOutlinePushPin, MdCreate, MdDelete } from "react-icons/md";
import moment from 'moment';

const NoteCard = ({ title, date, content, tags, isPinned, onEdit, onDelete, onPinNote }) => {
  // Check if the date is valid and format it, otherwise use a default string
  const formattedDate = moment(date).isValid() ? moment(date).format('Do MMM YYYY') : 'No Date Provided';

  return (
    <div className="relative border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-sm font-medium">{title}</h6>
          <span className="text-xs text-slate-500">{formattedDate}</span>
        </div>

        <MdOutlinePushPin
          className={`icon btn absolute top-4 right-4 ${isPinned ? 'text-primary' : 'text-slate-300'}`}
          onClick={onPinNote}
          aria-label={isPinned ? 'Unpin note' : 'Pin note'}
        />
      </div>
      <p className="text-xs text-slate-600 mt-2">
        {content?.slice(0, 60)}
      </p>

      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-slate-500">
          {tags.map((item, index) => (
            <span key={index} className="mr-1">#{item}</span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <MdCreate
            className="icon-btn hover:text-green-600"
            onClick={onEdit}
            aria-label="Edit note"
          />
          <MdDelete
            className="icon-btn hover:text-red-500"
            onClick={onDelete}
            aria-label="Delete note"
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;











