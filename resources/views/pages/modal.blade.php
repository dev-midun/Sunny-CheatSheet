<x-modal-form 
	id="questions-modal"
	title="Questions"
	size="xl">

    <x-form 
        id="questions-modal-form"
        :action="route('questions.create')"
        prefix="questions-modal-"
        model="questions"
        :formElement="false">

		<div class="row mb-3">
			<div class="col">
				<x-textarea-field
					label="Name"
					bindTo="name"
					id="questions-modal-name"
					placeholder="Silahkan masukkan soalnya dimari"
					:required="true"
				/>
			</div>
		</div>

		<div class="row">
			<div class="col">
				<x-button
					id="new-answers"
					label="New"
					icon="bx bx-plus"
					size="sm"
					className="mb-2"
				/>
				<table id="answers_table" class="table table-sm table-hover">
					<thead>
						<th class="d-none"></th>
						<th class="text-end">#</th>
						<th>Answer</th>
						<th class="align-middle text-center">Is Correct</th>
						<th>Action</th>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		</div>

		<div class="hstack gap-2 justify-content-center mt-4">
			<x-button id="questions-modal-save" type="submit" label="Save"/>
            <x-cancel-button data-bs-dismiss="modal" aria-label="Close"/>
		</div>

    </x-form>

</x-modal>