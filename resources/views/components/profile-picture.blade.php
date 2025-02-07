@props([
    'id' => null,
    'picture' => null
])

<div class="profile-user position-relative d-inline-block mx-auto mb-4">
    <img id="{{ $id }}-preview" src="{{ is_null($picture) ? Vite::asset('resources/velzon/images/users/user-dummy-img.jpg') : $picture }}" class="rounded-circle avatar-xl img-thumbnail user-profile-image" alt="user-profile-image">
    <div class="avatar-xs p-0 rounded-circle profile-photo-edit">
        <input id="{{ $id }}" type="file" class="profile-img-file-input" accept="image/png, image/jpeg" solar-form="default:file">
        <label for="{{ $id }}" class="profile-photo-edit avatar-xs">
            <span class="avatar-title rounded-circle bg-light text-body" data-bs-toggle="tooltip" data-bs-placement="top" title="Change picture">
                <i class="ri-camera-fill"></i>
            </span>
        </label>
    </div>
</div>