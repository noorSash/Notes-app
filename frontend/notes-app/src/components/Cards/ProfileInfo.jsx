import React from 'react';
import { getInitials } from '../../utils/heler'; 

const ProfileInfo = ({ userInfo, onLogout }) => {
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
                {getInitials(userInfo?.fullname)}
            </div>
            <div className="flex flex-col items-start">
                <p className="text-sm font-medium">{userInfo?.fullname}</p>
                <button className="text-sm text-slate-700 underline" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileInfo;



