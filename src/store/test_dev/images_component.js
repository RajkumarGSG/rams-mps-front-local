//import Api from '@/api/image_showing'

export default {
  state: {
  },
  data() {
    return {
    }
  },

  actions: {
    async READ_IMAGE_FILES({ }, fileName) {
      const ff = new File([], fileName, { type: "image/png" })
      console.log("file: ", ff)

      const reader = new FileReader()
      let res = null
      reader.onload = (evt) => {
        res = evt.target.result;
        //const base64String = `data:image/png;charset=utf-8;base64, ${btoa(this.imageUrl1)}`
      }
      reader.onerror = (err) => console.log(err)
      reader.readAsDataURL(ff)
      return res
    },

    async READ_SERVER_IMAGE_FILES({ }, fileName) {
      try {
        const response = await Api.load_image_file(fileName)
        const { status } = response
        if (status === 200) {
          console.log(response)
          const data = response.text()
          return response
          //this.imageUrl1 = URL.createObjectURL(data);
        } else {
          throw `Error READ_SERVER_IMAGE_FILES: ${status}`
        }
      } catch (err) {
        console.error('Fetch Error :-S', err);
      }
    },

  },

  mutations: {
  },

}