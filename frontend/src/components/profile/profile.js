import './profile.css';

function profile( { user } ) {
    
    // const updateRestaurant = () => {
        
    // }

    
    
    return (
        <div className="profile-layout">
            {user ? (
                <div className="profile">
                    <h1 className="underline">{user.username}'s Profile </h1>
                    <br />
                    <div className="sameline">
                    <h2>Favorite Restaurant: {user.favRestaurant} </h2>
                    <button type="button" className="btn btn-secondary">Update Restaurant</button>
                    </div>
                    <br />
                    <div className="sameline">
                    <h2>Favorite Cuisine: {user.favCuisine} </h2>
                    <button  type="button" className="btn btn-secondary">Update Cuisine</button>
                    </div>
                </div>
            ) : (
                <p>How did you get here </p>
            )}

            
            </div>
    );
}

export default profile;