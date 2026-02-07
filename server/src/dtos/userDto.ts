import type { UserDtoType } from "../types/auth";

class UserDto implements UserDtoType {
    email: string;
    id: string;
    isActivated: boolean;

    constructor(model: { _id: any; email: string; isActivated: boolean }) {
        this.email = model.email;
        this.id = typeof model._id === 'object' ? model._id.toString() : model._id;
        this.isActivated = model.isActivated;
    }
}

export default UserDto;