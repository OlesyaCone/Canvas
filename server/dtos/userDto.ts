import type { UserDtoType } from "../types/auth";

class UserDto {
    email: string;
    id: string;
    isActivated: boolean;

    constructor(model: UserDtoType) {
        this.email = model.email;
        this.id = model._id; 
        this.isActivated = model.isActivated;
    }
}

export default UserDto;